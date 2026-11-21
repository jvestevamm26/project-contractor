const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const contractorRoutes = require("./routes/contractorRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "10mb" }));

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ message: "Malformed JSON body" });
    }
    next(err);
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("The Contractor API is running");
});
app.get("/database-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).send("Database connection failed");
    }
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(400).json({ message: err.message || "Request error" });
});

module.exports = { app, FRONTEND_URL };
