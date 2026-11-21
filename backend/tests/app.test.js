jest.mock("../db", () => ({ query: jest.fn() }));

const request = require("supertest");
const db = require("../db");
const { app } = require("../app");

describe("app-level behaviour", () => {
    test("GET / reports the API is running", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toMatch(/running/i);
    });

    test("malformed JSON returns a JSON 400 instead of an HTML stack trace", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .set("Content-Type", "application/json")
            .send("{ not json");
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Malformed JSON body" });
    });

    test("CORS only allows the configured frontend origin", async () => {
        const res = await request(app).get("/").set("Origin", "http://localhost:5173");
        expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    });

    test("GET /database-test returns 500 when the DB is down", async () => {
        db.query.mockRejectedValue(new Error("connection refused"));
        const res = await request(app).get("/database-test");
        expect(res.status).toBe(500);
    });

    test("GET /database-test returns rows when the DB responds", async () => {
        db.query.mockResolvedValue({ rows: [{ now: "2026-01-01" }] });
        const res = await request(app).get("/database-test");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ now: "2026-01-01" }]);
    });
});
