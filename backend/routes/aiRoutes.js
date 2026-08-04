const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { authenticate } = require("../middleware/authMiddleware");

const {
    askAssistant
} = require("../controllers/aiController");


const askLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests to the AI assistant, please slow down" }
});


router.post("/ask", authenticate, askLimiter, askAssistant);


module.exports = router;
