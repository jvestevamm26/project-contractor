jest.mock("../models/userModel");

const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { app } = require("../app");

describe("POST /api/users/register", () => {
    const valid = { name: "Ana", email: "ana@example.com", password: "pw123456", role: "client" };

    test("creates a user, hashes the password, and trims name/email", async () => {
        User.createUser.mockResolvedValue({ id: 1, name: "Ana", email: "ana@example.com", role: "client" });

        const res = await request(app)
            .post("/api/users/register")
            .send({ ...valid, name: "  Ana ", email: " ana@example.com " });

        expect(res.status).toBe(201);
        expect(res.body).not.toHaveProperty("password");

        const [name, email, hashed, role] = User.createUser.mock.calls[0];
        expect(name).toBe("Ana");
        expect(email).toBe("ana@example.com");
        expect(role).toBe("client");
        expect(hashed).not.toBe(valid.password);
        expect(await bcrypt.compare(valid.password, hashed)).toBe(true);
    });

    test.each(["name", "email", "password", "role"])("rejects a missing %s", async (field) => {
        const body = { ...valid };
        delete body[field];
        const res = await request(app).post("/api/users/register").send(body);
        expect(res.status).toBe(400);
        expect(User.createUser).not.toHaveBeenCalled();
    });

    test("rejects a whitespace-only name", async () => {
        const res = await request(app).post("/api/users/register").send({ ...valid, name: "   " });
        expect(res.status).toBe(400);
    });

    test("rejects an unknown role (no self-promotion to admin)", async () => {
        const res = await request(app).post("/api/users/register").send({ ...valid, role: "admin" });
        expect(res.status).toBe(400);
        expect(User.createUser).not.toHaveBeenCalled();
    });

    test("returns 409 for a duplicate email", async () => {
        User.createUser.mockRejectedValue(Object.assign(new Error("dup"), { code: "23505" }));
        const res = await request(app).post("/api/users/register").send(valid);
        expect(res.status).toBe(409);
    });

    test("returns 500 on an unexpected DB error", async () => {
        User.createUser.mockRejectedValue(new Error("boom"));
        const res = await request(app).post("/api/users/register").send(valid);
        expect(res.status).toBe(500);
    });
});

describe("POST /api/users/login", () => {
    let storedUser;

    beforeAll(async () => {
        storedUser = {
            id: 5,
            email: "bob@example.com",
            role: "contractor",
            password: await bcrypt.hash("correct-horse", 4)
        };
    });

    test("returns a JWT carrying id and role with a 1-day expiry", async () => {
        User.findUserByEmail.mockResolvedValue(storedUser);

        const res = await request(app)
            .post("/api/users/login")
            .send({ email: " bob@example.com ", password: "correct-horse" });

        expect(res.status).toBe(200);
        expect(User.findUserByEmail).toHaveBeenCalledWith("bob@example.com");
        const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(payload).toMatchObject({ id: 5, role: "contractor" });
        expect(payload.exp - payload.iat).toBe(24 * 60 * 60);
    });

    test("rejects an unknown email", async () => {
        User.findUserByEmail.mockResolvedValue(undefined);
        const res = await request(app).post("/api/users/login").send({ email: "x@y.z", password: "pw" });
        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });

    test("rejects a wrong password", async () => {
        User.findUserByEmail.mockResolvedValue(storedUser);
        const res = await request(app)
            .post("/api/users/login")
            .send({ email: "bob@example.com", password: "nope" });
        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });
});
