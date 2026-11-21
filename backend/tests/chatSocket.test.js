jest.mock("../models/projectModel");
jest.mock("../models/contractorModel");
jest.mock("../models/messageModel");

const http = require("http");
const { Server } = require("socket.io");
const { io: ioClient } = require("socket.io-client");
const Project = require("../models/projectModel");
const Contractor = require("../models/contractorModel");
const Message = require("../models/messageModel");
const { registerChatSocket } = require("../sockets/chatSocket");
const { tokenFor, CLIENT, CONTRACTOR, OTHER_CLIENT } = require("./helpers");

let httpServer;
let io;
let url;
const clients = [];

const connect = (token) =>
    new Promise((resolve, reject) => {
        const socket = ioClient(url, { auth: { token }, transports: ["websocket"], reconnection: false });
        clients.push(socket);
        socket.on("connect", () => resolve(socket));
        socket.on("connect_error", reject);
    });

const nextEvent = (socket, event, timeout = 1000) =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`timed out waiting for ${event}`)), timeout);
        socket.once(event, (payload) => {
            clearTimeout(timer);
            resolve(payload);
        });
    });

beforeAll(
    () =>
        new Promise((resolve) => {
            httpServer = http.createServer();
            io = new Server(httpServer);
            registerChatSocket(io);
            httpServer.listen(0, () => {
                url = `http://localhost:${httpServer.address().port}`;
                resolve();
            });
        })
);

afterAll(
    () =>
        new Promise((resolve) => {
            io.close(() => resolve());
        })
);

beforeEach(() => {
    Project.getProjectById.mockImplementation(async (id) =>
        Number(id) === 100 ? { id: 100, client_id: CLIENT.id, contractor_id: 10 } : undefined
    );
    Contractor.getProfileById.mockResolvedValue({ id: 10, user_id: CONTRACTOR.id });
    Message.createMessage.mockImplementation(async (sender, receiver, projectId, message) => ({
        id: 1,
        sender_id: sender,
        receiver_id: receiver,
        project_id: projectId,
        message
    }));
});

afterEach(() => {
    while (clients.length) clients.pop().disconnect();
});

describe("chat socket", () => {
    test("rejects connections without a valid token", async () => {
        await expect(connect("garbage")).rejects.toThrow("Authentication error");
        await expect(connect(undefined)).rejects.toThrow("Authentication error");
    });

    test("outsiders cannot join a project room", async () => {
        const socket = await connect(tokenFor(OTHER_CLIENT));
        const error = nextEvent(socket, "chat_error");
        socket.emit("join_project", 100);
        await expect(error).resolves.toEqual({ message: "You are not part of this project" });
    });

    test("joining a non-existent project errors", async () => {
        const socket = await connect(tokenFor(CLIENT));
        const error = nextEvent(socket, "chat_error");
        socket.emit("join_project", 999);
        await expect(error).resolves.toEqual({ message: "Project not found" });
    });

    test("client message is persisted with the contractor as receiver and broadcast to the room", async () => {
        const client = await connect(tokenFor(CLIENT));
        const contractor = await connect(tokenFor(CONTRACTOR));

        client.emit("join_project", 100);
        contractor.emit("join_project", 100);
        // join_project has no ack; give the server a tick to process both joins.
        await new Promise((r) => setTimeout(r, 100));

        const received = nextEvent(contractor, "new_message");
        client.emit("send_message", { projectId: 100, message: "  When can you come?  " });

        const msg = await received;
        expect(msg).toMatchObject({ sender_id: CLIENT.id, receiver_id: CONTRACTOR.id, message: "When can you come?" });
        expect(Message.createMessage).toHaveBeenCalledWith(CLIENT.id, CONTRACTOR.id, 100, "When can you come?");
    });

    test("blank messages are rejected", async () => {
        const socket = await connect(tokenFor(CLIENT));
        const error = nextEvent(socket, "chat_error");
        socket.emit("send_message", { projectId: 100, message: "   " });
        await error;
        expect(Message.createMessage).not.toHaveBeenCalled();
    });

    test("outsiders cannot send messages", async () => {
        const socket = await connect(tokenFor(OTHER_CLIENT));
        const error = nextEvent(socket, "chat_error");
        socket.emit("send_message", { projectId: 100, message: "spam" });
        await expect(error).resolves.toEqual({ message: "You are not part of this project" });
        expect(Message.createMessage).not.toHaveBeenCalled();
    });
});
