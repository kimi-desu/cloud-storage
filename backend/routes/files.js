const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../db");

const router = express.Router();


// MULTER STORAGE CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


// UPLOAD FILE
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    error: "No file uploaded"
                });
            }

            // save metadata to database
            const result = await pool.query(
                `INSERT INTO files
                (user_id, filename, filepath, filesize)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [
                    req.user.id,
                    file.originalname,
                    file.path,
                    file.size
                ]
            );

            res.json({
                message: "File uploaded successfully",
                file: result.rows[0]
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: "Server error"
            });
        }
    }
);


// GET MY FILES
router.get(
    "/my-files",
    authMiddleware,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT * FROM files
                 WHERE user_id = $1
                 ORDER BY uploaded_at DESC`,
                [req.user.id]
            );

            res.json(result.rows);

        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: "Server error"
            });
        }
    }
);


// DOWNLOAD FILE BY ID
router.get(
    "/download/:id",
    authMiddleware,
    async (req, res) => {
        const { id } = req.params;

        try {
            // 1. Cari data file di database
            const result = await pool.query(
                "SELECT * FROM files WHERE id = $1",
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: "File not found"
                });
            }

            const file = result.rows[0];

            // 2. Validasi kepemilikan file
            if (file.user_id !== req.user.id) {
                return res.status(403).json({
                    error: "You do not have permission to download this file"
                });
            }

            // 3. Tentukan path file di storage backend
            const normalizedPath = file.filepath.replace(/\\/g, "/");
            const filePath = path.join(process.cwd(), normalizedPath);

            res.download(filePath, file.filename, (err) => {
                    if (err) {
                        console.error("Download error detail:", err); 
                        if (!res.headersSent) {
                            return res.status(500).json({ 
                                error: "Could not download the file" 
                            });
                        }
                    }
                });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: "Server error"
            });
        }
    }
);


// DELETE FILE
router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {
        const { id } = req.params;

        try {
            const result = await pool.query(
                "SELECT * FROM files WHERE id = $1",
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: "File not found"
                });
            }

            const file = result.rows[0];

            if (file.user_id !== req.user.id) {
                return res.status(403).json({
                    error: "You do not have permission to delete this file"
                });
            }

            const filePath = path.join(__dirname, "..", file.filepath);

            try {
                await fs.unlink(filePath);
            } catch (err) {
                console.error("File deletion error:", err);
                return res.status(500).json({
                    error: "Unable to delete stored file"
                });
            }

            await pool.query(
                "DELETE FROM files WHERE id = $1",
                [id]
            );

            return res.status(200).json({
                message: "File deleted successfully"
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: "Server error"
            });
        }
    }
);

module.exports = router;