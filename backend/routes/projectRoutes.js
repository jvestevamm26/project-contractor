const express = require("express");
const router = express.Router();

const {
    createProject,
    getProjectById,
    getProjectsByClient,
    getProjectsByContractor,
    updateProjectStatus
} = require("../controllers/projectController");


router.post("/", createProject);
router.get("/client/:clientId", getProjectsByClient);
router.get("/contractor/:contractorId", getProjectsByContractor);
router.patch("/:id/status", updateProjectStatus);
router.get("/:id", getProjectById);


module.exports = router;