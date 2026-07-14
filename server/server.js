const db = require("./db");
const contractorRoutes = require("./routes/contractorRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const projectRoutes = require("./routes/projectRoutes");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/projects", projectRoutes);
const PORT = process.env.PORT || 5000;
app.use("/api/services", serviceRoutes);
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