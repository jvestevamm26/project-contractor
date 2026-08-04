const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");

const {
    getProjectMessages
} = require("../controllers/messageController");


router.get("/project/:projectId", authenticate, getProjectMessages);


module.exports = router;
