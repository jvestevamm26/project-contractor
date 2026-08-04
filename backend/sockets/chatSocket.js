const { verifyToken } = require("../middleware/authMiddleware");
const Project = require("../models/projectModel");
const Contractor = require("../models/contractorModel");
const Message = require("../models/messageModel");
const { isProjectParticipant } = require("../utils/projectAccess");
const { isValidId } = require("../utils/validateId");


const roomName = (projectId) => `project:${projectId}`;


const getReceiverId = async (project, senderId) => {
    if (project.client_id === senderId) {
        const profile = await Contractor.getProfileById(project.contractor_id);
        return profile ? profile.user_id : null;
    }

    return project.client_id;
};


const registerChatSocket = (io) => {

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            socket.user = verifyToken(token);
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {

        socket.on("join_project", async (projectId) => {
            try {
                if (!isValidId(projectId)) {
                    return socket.emit("chat_error", { message: "Invalid project id" });
                }

                const project = await Project.getProjectById(projectId);

                if (!project) {
                    return socket.emit("chat_error", { message: "Project not found" });
                }

                const allowed = await isProjectParticipant(project, socket.user.id);

                if (!allowed) {
                    return socket.emit("chat_error", { message: "You are not part of this project" });
                }

                socket.join(roomName(projectId));
            } catch (error) {
                console.log(error);
                socket.emit("chat_error", { message: "Could not join project chat" });
            }
        });

        socket.on("send_message", async ({ projectId, message } = {}) => {
            try {
                if (!isValidId(projectId) || !message || !message.trim()) {
                    return socket.emit("chat_error", { message: "A project id and message are required" });
                }

                const project = await Project.getProjectById(projectId);

                if (!project) {
                    return socket.emit("chat_error", { message: "Project not found" });
                }

                const allowed = await isProjectParticipant(project, socket.user.id);

                if (!allowed) {
                    return socket.emit("chat_error", { message: "You are not part of this project" });
                }

                const receiverId = await getReceiverId(project, socket.user.id);
                const saved = await Message.createMessage(socket.user.id, receiverId, projectId, message.trim());

                io.to(roomName(projectId)).emit("new_message", saved);
            } catch (error) {
                console.log(error);
                socket.emit("chat_error", { message: "Could not send message" });
            }
        });

    });

};


module.exports = { registerChatSocket };
