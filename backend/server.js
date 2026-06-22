require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use("/auth", authRoutes);
app.use("/files", fileRoutes);

app.get("/", (req, res) => {
  res.json({
    now: new Date()
  });
});

const PORT = process.env.PORT || 3000;

console.log("PORT ENV:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "EXISTS" : "MISSING");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});