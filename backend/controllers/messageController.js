const Message = require("../models/messageModel");
const Project = require("../models/projectModel");
const { isValidId } = require("../utils/validateId");
const { isProjectParticipant } = require("../utils/projectAccess");


const getProjectMessages = async (req, res) => {

    try {

        if (!isValidId(req.params.projectId)) {
            return res.status(400).json({
                message: "Invalid project id"
            });
        }

        const project = await Project.getProjectById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const allowed = await isProjectParticipant(project, req.user.id);

        if (!allowed) {
            return res.status(403).json({
                message: "You are not part of this project"
            });
        }

        const messages = await Message.getMessagesByProject(req.params.projectId);

        res.json(messages);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching messages"
        });

    }

};


module.exports = {
    getProjectMessages
};
