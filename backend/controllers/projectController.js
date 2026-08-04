const Project = require("../models/projectModel");
const Contractor = require("../models/contractorModel");
const { isValidId } = require("../utils/validateId");
const { normalizeNumeric, isNonNegativeOrNull } = require("../utils/numericField");

const STATUS_TRANSITIONS = {
    pending: ["accepted", "declined"],
    accepted: ["in_progress"],
    in_progress: ["completed"],
    declined: [],
    completed: []
};


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

        const trimmedTitle = typeof title === "string" ? title.trim() : "";

        if (!client_id || !contractor_id || !isValidId(contractor_id) || !trimmedTitle) {
            return res.status(400).json({
                message: "client_id, a valid contractor_id, and title are required"
            });
        }

        if (Number(client_id) !== req.user.id) {
            return res.status(403).json({
                message: "You can only create projects as yourself"
            });
        }

        const normalizedPrice = normalizeNumeric(price);

        if (!isNonNegativeOrNull(normalizedPrice)) {
            return res.status(400).json({
                message: "price must be a non-negative number"
            });
        }

        const project = await Project.createProject(
            client_id,
            contractor_id,
            trimmedTitle,
            description,
            normalizedPrice,
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


const getAllProjects = async (req, res) => {

    try {

        const projects = await Project.getAllProjects();

        res.json(projects);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching projects"
        });

    }

};


const getProjectById = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

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

        if (!isValidId(req.params.clientId)) {
            return res.status(400).json({
                message: "Invalid client id"
            });
        }

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

        if (!isValidId(req.params.contractorId)) {
            return res.status(400).json({
                message: "Invalid contractor id"
            });
        }

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

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const { status } = req.body;

        const validStatuses = ["pending", "accepted", "declined", "in_progress", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const existing = await Project.getProjectById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const profile = await Contractor.getProfileById(existing.contractor_id);

        if (!profile || profile.user_id !== req.user.id) {
            return res.status(403).json({
                message: "Only the assigned contractor can update this project's status"
            });
        }

        const allowedNextStatuses = STATUS_TRANSITIONS[existing.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                message: `Cannot move a project from '${existing.status}' to '${status}'`
            });
        }

        const project = await Project.updateProjectStatus(req.params.id, status);

        res.json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating project status"
        });

    }

};


const updateProject = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const existing = await Project.getProjectById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (existing.client_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this project"
            });
        }

        const { title, description, price, location } = req.body;

        const trimmedTitle = typeof title === "string" ? title.trim() : "";

        if (!trimmedTitle) {
            return res.status(400).json({
                message: "title is required"
            });
        }

        const normalizedPrice = normalizeNumeric(price);

        if (!isNonNegativeOrNull(normalizedPrice)) {
            return res.status(400).json({
                message: "price must be a non-negative number"
            });
        }

        const project = await Project.updateProject(
            req.params.id,
            trimmedTitle,
            description,
            normalizedPrice,
            location
        );

        res.json(project);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error updating project"
        });

    }

};


const deleteProject = async (req, res) => {

    try {

        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const existing = await Project.getProjectById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (existing.client_id !== req.user.id) {
            return res.status(403).json({
                message: "You do not own this project"
            });
        }

        await Project.deleteProject(req.params.id);

        res.json({ message: "Project deleted" });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error deleting project"
        });

    }

};


module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    getProjectsByClient,
    getProjectsByContractor,
    updateProjectStatus,
    updateProject,
    deleteProject
};
