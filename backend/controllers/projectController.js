const Project = require("../models/projectModel");


const createProject = async (req, res) => {

    try {

           const {
    client_id,
    contractor_id,
    title,
    description,
    price,
    location
} = req.body;

        if (!client_id || !contractor_id || !title) {
            return res.status(400).json({
                message: "client_id, contractor_id, and title are required"
            });
        }

          const project = await Project.createProject(
    client_id,
    contractor_id,
    title,
    description,
    price,
    location
);

        res.status(201).json(project);


    } catch(error) {

        console.log(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "client_id or contractor_id does not match an existing record"
            });
        }

        res.status(500).json({
            message: "Error creating project"
        });

    }

};


const getProjectById = async (req, res) => {

    try {

        const project = await Project.getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching project"
        });

    }

};


const getProjectsByClient = async (req, res) => {

    try {

        const projects = await Project.getProjectsByClient(req.params.clientId);

        res.json(projects);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching client's projects"
        });

    }

};


const getProjectsByContractor = async (req, res) => {

    try {

        const projects = await Project.getProjectsByContractor(req.params.contractorId);

        res.json(projects);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching contractor's projects"
        });

    }

};


const updateProjectStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const validStatuses = ["pending", "accepted", "declined", "in_progress", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const project = await Project.updateProjectStatus(req.params.id, status);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating project status"
        });

    }

};


module.exports = {
    createProject,
    getProjectById,
    getProjectsByClient,
    getProjectsByContractor,
    updateProjectStatus
};