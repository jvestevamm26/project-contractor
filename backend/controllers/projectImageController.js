const fs = require("fs");
const ProjectImage = require("../models/projectImageModel");
const Project = require("../models/projectModel");
const { isValidId } = require("../utils/validateId");
const { isProjectParticipant } = require("../utils/projectAccess");


const deleteUploadedFile = (file) => {
    if (!file) return;
    fs.unlink(file.path, (err) => {
        if (err) console.log(err);
    });
};


const uploadProjectImage = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            deleteUploadedFile(req.file);
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const project = await Project.getProjectById(req.params.id);

        if (!project) {
            deleteUploadedFile(req.file);
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const allowed = await isProjectParticipant(project, req.user.id);

        if (!allowed) {
            deleteUploadedFile(req.file);
            return res.status(403).json({
                message: "You are not part of this project"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "An image file is required"
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const image = await ProjectImage.createImage(req.params.id, imageUrl, req.body.description);

        res.status(201).json(image);

    } catch (error) {

        console.log(error);
        deleteUploadedFile(req.file);

        res.status(500).json({
            message: "Error uploading project image"
        });

    }

};


const getProjectImages = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const images = await ProjectImage.getImagesByProject(req.params.id);

        res.json(images);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching project images"
        });

    }

};


module.exports = {
    uploadProjectImage,
    getProjectImages
};
