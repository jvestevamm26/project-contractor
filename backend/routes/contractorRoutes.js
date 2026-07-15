const express = require("express");
const router = express.Router();

const {
    createContractorProfile,
    getProfileByUserId
} = require("../controllers/contractorController");


router.post("/profile", createContractorProfile);
router.get("/profile/user/:userId", getProfileByUserId);


module.exports = router;