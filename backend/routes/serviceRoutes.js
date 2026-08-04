const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/authMiddleware");

const {
    createService,
    getAllServices,
    getServiceById,
    getServicesByContractor,
    updateService,
    deleteService
} = require("../controllers/serviceController");


router.post("/", authenticate, authorize("contractor"), createService);
router.get("/", getAllServices);
router.get("/contractor/:contractorId", getServicesByContractor);
router.put("/:id", authenticate, authorize("contractor"), updateService);
router.delete("/:id", authenticate, authorize("contractor"), deleteService);
router.get("/:id", getServiceById);


module.exports = router;
