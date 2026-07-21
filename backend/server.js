const db = require("./db");
const contractorRoutes = require("./routes/contractorRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const aiRoutes = require("./routes/aiRoutes");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
// BUG (deferred): a malformed JSON request body currently falls through to
// Express's default error handler, which returns an HTML page with a full
// stack trace and file paths. Needs a JSON error-handling middleware here
// (app.use((err, req, res, next) => {...})) before this reaches production.
app.use("/api/users", userRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/projects", projectRoutes);
const PORT = process.env.PORT || 5000;
app.use("/api/services", serviceRoutes);
app.use("/api/ai", aiRoutes);
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});