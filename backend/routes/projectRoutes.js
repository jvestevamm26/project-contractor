const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createProject,
    getAllProjects,
    getProjectById,
    getProjectsByClient,
    getProjectsByContractor,
    updateProjectStatus,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const {
    uploadProjectImage,
    getProjectImages
} = require("../controllers/projectImageController");


router.post("/", authenticate, authorize("client"), createProject);
router.get("/", authenticate, getAllProjects);
router.get("/client/:clientId", getProjectsByClient);
router.get("/contractor/:contractorId", getProjectsByContractor);
router.patch("/:id/status", authenticate, updateProjectStatus);
router.put("/:id", authenticate, updateProject);
router.delete("/:id", authenticate, deleteProject);
router.post("/:id/images", authenticate, upload.single("image"), uploadProjectImage);
router.get("/:id/images", getProjectImages);
router.get("/:id", getProjectById);


module.exports = router;
