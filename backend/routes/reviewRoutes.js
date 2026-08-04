const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
    createReview,
    getReviewsByContractor
} = require("../controllers/reviewController");


router.post("/", authenticate, authorize("client"), createReview);
router.get("/contractor/:contractorId", getReviewsByContractor);


module.exports = router;
