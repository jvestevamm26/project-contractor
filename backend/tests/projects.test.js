jest.mock("../models/projectModel");
jest.mock("../models/contractorModel");

const request = require("supertest");
const Project = require("../models/projectModel");
const Contractor = require("../models/contractorModel");
const { app } = require("../app");
const { bearer, CLIENT, CONTRACTOR, OTHER_CLIENT } = require("./helpers");

// Contractor profile 10 belongs to user CONTRACTOR (id 2).
const PROFILE = { id: 10, user_id: CONTRACTOR.id };
const project = (overrides = {}) => ({
    id: 100,
    client_id: CLIENT.id,
    contractor_id: PROFILE.id,
    title: "Fix sink",
    status: "pending",
    ...overrides
});

beforeEach(() => {
    Contractor.getProfileById.mockImplementation(async (id) => (Number(id) === PROFILE.id ? PROFILE : undefined));
});

describe("POST /api/projects", () => {
    const body = { client_id: CLIENT.id, contractor_id: PROFILE.id, title: "Fix sink", price: "120" };

    test("requires authentication", async () => {
        const res = await request(app).post("/api/projects").send(body);
        expect(res.status).toBe(401);
    });

    test("only clients can create projects", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", bearer(CONTRACTOR))
            .send(body);
        expect(res.status).toBe(403);
    });

    test("cannot create a project on behalf of another client", async () => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", bearer(OTHER_CLIENT))
            .send(body);
        expect(res.status).toBe(403);
        expect(Project.createProject).not.toHaveBeenCalled();
    });

    test("creates a project with a trimmed title and numeric price", async () => {
        Project.createProject.mockResolvedValue(project());
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", bearer(CLIENT))
            .send({ ...body, title: "  Fix sink  " });
        expect(res.status).toBe(201);
        expect(Project.createProject).toHaveBeenCalledWith(CLIENT.id, PROFILE.id, "Fix sink", undefined, 120, undefined);
    });

    test.each([
        ["missing title", { title: "" }],
        ["non-numeric contractor_id", { contractor_id: "abc" }],
        ["negative price", { price: -5 }],
        ["non-numeric price", { price: "lots" }]
    ])("rejects %s", async (_label, overrides) => {
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", bearer(CLIENT))
            .send({ ...body, ...overrides });
        expect(res.status).toBe(400);
        expect(Project.createProject).not.toHaveBeenCalled();
    });

    test("maps a foreign-key violation to 400", async () => {
        Project.createProject.mockRejectedValue(Object.assign(new Error("fk"), { code: "23503" }));
        const res = await request(app)
            .post("/api/projects")
            .set("Authorization", bearer(CLIENT))
            .send(body);
        expect(res.status).toBe(400);
    });
});

describe("GET /api/projects/:id", () => {
    test("rejects a non-numeric id", async () => {
        const res = await request(app).get("/api/projects/abc");
        expect(res.status).toBe(400);
    });

    test("returns 404 when missing", async () => {
        Project.getProjectById.mockResolvedValue(undefined);
        const res = await request(app).get("/api/projects/999");
        expect(res.status).toBe(404);
    });

    test("returns the project", async () => {
        Project.getProjectById.mockResolvedValue(project());
        const res = await request(app).get("/api/projects/100");
        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Fix sink");
    });
});

describe("PATCH /api/projects/:id/status", () => {
    const patch = (user, status) =>
        request(app).patch("/api/projects/100/status").set("Authorization", bearer(user)).send({ status });

    test("only the assigned contractor can change status", async () => {
        Project.getProjectById.mockResolvedValue(project());
        const res = await patch(CLIENT, "accepted");
        expect(res.status).toBe(403);
        expect(Project.updateProjectStatus).not.toHaveBeenCalled();
    });

    test("rejects an unknown status", async () => {
        const res = await patch(CONTRACTOR, "teleported");
        expect(res.status).toBe(400);
    });

    test.each([
        ["pending", "accepted"],
        ["pending", "declined"],
        ["accepted", "in_progress"],
        ["in_progress", "completed"]
    ])("allows %s -> %s", async (from, to) => {
        Project.getProjectById.mockResolvedValue(project({ status: from }));
        Project.updateProjectStatus.mockResolvedValue(project({ status: to }));
        const res = await patch(CONTRACTOR, to);
        expect(res.status).toBe(200);
        expect(Project.updateProjectStatus).toHaveBeenCalledWith("100", to);
    });

    test.each([
        ["pending", "completed"],
        ["pending", "in_progress"],
        ["accepted", "pending"],
        ["declined", "accepted"],
        ["completed", "in_progress"]
    ])("blocks %s -> %s", async (from, to) => {
        Project.getProjectById.mockResolvedValue(project({ status: from }));
        const res = await patch(CONTRACTOR, to);
        expect(res.status).toBe(400);
        expect(Project.updateProjectStatus).not.toHaveBeenCalled();
    });
});

describe("PUT /api/projects/:id and DELETE /api/projects/:id", () => {
    beforeEach(() => {
        Project.getProjectById.mockResolvedValue(project());
    });

    test("owner can update; empty price becomes null", async () => {
        Project.updateProject.mockResolvedValue(project({ title: "New" }));
        const res = await request(app)
            .put("/api/projects/100")
            .set("Authorization", bearer(CLIENT))
            .send({ title: "New", price: "" });
        expect(res.status).toBe(200);
        expect(Project.updateProject).toHaveBeenCalledWith("100", "New", undefined, null, undefined);
    });

    test("non-owner cannot update", async () => {
        const res = await request(app)
            .put("/api/projects/100")
            .set("Authorization", bearer(OTHER_CLIENT))
            .send({ title: "Hijack" });
        expect(res.status).toBe(403);
        expect(Project.updateProject).not.toHaveBeenCalled();
    });

    test("owner can delete", async () => {
        const res = await request(app).delete("/api/projects/100").set("Authorization", bearer(CLIENT));
        expect(res.status).toBe(200);
        expect(Project.deleteProject).toHaveBeenCalledWith("100");
    });

    test("assigned contractor cannot delete the client's project", async () => {
        const res = await request(app).delete("/api/projects/100").set("Authorization", bearer(CONTRACTOR));
        expect(res.status).toBe(403);
        expect(Project.deleteProject).not.toHaveBeenCalled();
    });
});
