jest.mock("../models/messageModel");
jest.mock("../models/projectModel");
jest.mock("../models/contractorModel");

const request = require("supertest");
const Message = require("../models/messageModel");
const Project = require("../models/projectModel");
const Contractor = require("../models/contractorModel");
const { app } = require("../app");
const { bearer, CLIENT, CONTRACTOR, OTHER_CLIENT } = require("./helpers");

const get = (user) => request(app).get("/api/messages/project/100").set("Authorization", bearer(user));

describe("GET /api/messages/project/:projectId", () => {
    beforeEach(() => {
        Project.getProjectById.mockResolvedValue({ id: 100, client_id: CLIENT.id, contractor_id: 10 });
        Contractor.getProfileById.mockResolvedValue({ id: 10, user_id: CONTRACTOR.id });
        Message.getMessagesByProject.mockResolvedValue([{ id: 1, message: "hi" }]);
    });

    test("requires auth", async () => {
        const res = await request(app).get("/api/messages/project/100");
        expect(res.status).toBe(401);
    });

    test.each([
        ["client", CLIENT],
        ["assigned contractor", CONTRACTOR]
    ])("%s can read history", async (_label, user) => {
        const res = await get(user);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test("outsiders get 403", async () => {
        const res = await get(OTHER_CLIENT);
        expect(res.status).toBe(403);
        expect(Message.getMessagesByProject).not.toHaveBeenCalled();
    });
});
