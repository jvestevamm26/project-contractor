const express = require("express");
const router = express.Router();

const {
    createContractorProfile
} = require("../controllers/contractorController");


router.post("/profile", createContractorProfile);


module.exports = router;