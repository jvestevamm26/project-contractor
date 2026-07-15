const express = require("express");
const router = express.Router();

const {
    createService,
    getAllServices,
    getServiceById,
    getServicesByContractor
} = require("../controllers/serviceController");


router.post("/", createService);
router.get("/", getAllServices);
router.get("/contractor/:contractorId", getServicesByContractor);
router.get("/:id", getServiceById);


module.exports = router;