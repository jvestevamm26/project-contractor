const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
    createContractorProfile,
    getProfileByUserId,
    getAllContractors,
    getContractorById,
    updateContractorProfile,
    deleteContractorProfile
} = require("../controllers/contractorController");


router.post("/profile", authenticate, authorize("contractor"), createContractorProfile);
router.get("/profile/user/:userId", getProfileByUserId);
router.put("/profile/:id", authenticate, authorize("contractor"), updateContractorProfile);
router.delete("/profile/:id", authenticate, authorize("contractor"), deleteContractorProfile);

router.get("/", getAllContractors);
router.get("/:id", getContractorById);


module.exports = router;
