jest.mock("../models/serviceModel");
jest.mock("../models/contractorModel");

const request = require("supertest");
const Service = require("../models/serviceModel");
const Contractor = require("../models/contractorModel");
const { app } = require("../app");
const { bearer, CLIENT, CONTRACTOR } = require("./helpers");

const OTHER_CONTRACTOR = { id: 9, role: "contractor" };
const PROFILE = { id: 10, user_id: CONTRACTOR.id };
const SERVICE = { id: 50, contractor_id: PROFILE.id, title: "Pipe repair", category: "plumbing" };

beforeEach(() => {
    Contractor.getProfileById.mockImplementation(async (id) => (Number(id) === PROFILE.id ? PROFILE : undefined));
});

describe("POST /api/services", () => {
    const body = { contractor_id: PROFILE.id, title: "Pipe repair", category: "plumbing", price: 80 };

    test("clients cannot create services", async () => {
        const res = await request(app).post("/api/services").set("Authorization", bearer(CLIENT)).send(body);
        expect(res.status).toBe(403);
    });

    test("contractor cannot create a service under someone else's profile", async () => {
        const res = await request(app)
            .post("/api/services")
            .set("Authorization", bearer(OTHER_CONTRACTOR))
            .send(body);
        expect(res.status).toBe(403);
        expect(Service.createService).not.toHaveBeenCalled();
    });

    test("profile owner can create a service", async () => {
        Service.createService.mockResolvedValue(SERVICE);
        const res = await request(app).post("/api/services").set("Authorization", bearer(CONTRACTOR)).send(body);
        expect(res.status).toBe(201);
    });

    test("requires a category", async () => {
        const res = await request(app)
            .post("/api/services")
            .set("Authorization", bearer(CONTRACTOR))
            .send({ ...body, category: " " });
        expect(res.status).toBe(400);
    });
});

describe("public reads", () => {
    test("GET /api/services lists without auth", async () => {
        Service.getAllServices.mockResolvedValue([SERVICE]);
        const res = await request(app).get("/api/services");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test("GET /api/services/:id returns 404 when missing", async () => {
        Service.getServiceById.mockResolvedValue(undefined);
        const res = await request(app).get("/api/services/1");
        expect(res.status).toBe(404);
    });
});

describe("PUT/DELETE /api/services/:id ownership", () => {
    beforeEach(() => {
        Service.getServiceById.mockResolvedValue(SERVICE);
    });

    test("non-owner contractor cannot update", async () => {
        const res = await request(app)
            .put("/api/services/50")
            .set("Authorization", bearer(OTHER_CONTRACTOR))
            .send({ title: "x", category: "y" });
        expect(res.status).toBe(403);
        expect(Service.updateService).not.toHaveBeenCalled();
    });

    test("non-owner contractor cannot delete", async () => {
        const res = await request(app).delete("/api/services/50").set("Authorization", bearer(OTHER_CONTRACTOR));
        expect(res.status).toBe(403);
        expect(Service.deleteService).not.toHaveBeenCalled();
    });

    test("owner can delete", async () => {
        const res = await request(app).delete("/api/services/50").set("Authorization", bearer(CONTRACTOR));
        expect(res.status).toBe(200);
        expect(Service.deleteService).toHaveBeenCalledWith("50");
    });
});
