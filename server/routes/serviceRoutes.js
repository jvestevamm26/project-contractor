const express = require("express");
const router = express.Router();

const {
    createService,
    getAllServices,
    getServiceById
} = require("../controllers/serviceController");


router.post("/", createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);


module.exports = router;