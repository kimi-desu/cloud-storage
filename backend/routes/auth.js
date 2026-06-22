const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();


// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check empty fields
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        // check existing email
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email`,
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Server error"
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // check user exists
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // compare password
        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        // create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Server error"
        });
    }
});


module.exports = router;