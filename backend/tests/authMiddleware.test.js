const jwt = require("jsonwebtoken");
const { authenticate, authorize, verifyToken } = require("../middleware/authMiddleware");
const { tokenFor, CLIENT } = require("./helpers");

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
};

describe("verifyToken", () => {
    test("returns only id and role from a valid token", () => {
        const token = jwt.sign({ id: 7, role: "client", extra: "x" }, process.env.JWT_SECRET);
        expect(verifyToken(token)).toEqual({ id: 7, role: "client" });
    });

    test("throws on a token signed with another secret", () => {
        const token = jwt.sign({ id: 7, role: "client" }, "wrong-secret");
        expect(() => verifyToken(token)).toThrow();
    });

    test("throws on an expired token", () => {
        const token = tokenFor(CLIENT, { expiresIn: -10 });
        expect(() => verifyToken(token)).toThrow();
    });
});

describe("authenticate", () => {
    test("rejects a missing header with 401", () => {
        const res = mockRes();
        const next = jest.fn();
        authenticate({ headers: {} }, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects a non-Bearer header with 401", () => {
        const res = mockRes();
        const next = jest.fn();
        authenticate({ headers: { authorization: `Token ${tokenFor(CLIENT)}` } }, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects a tampered token with 401", () => {
        const res = mockRes();
        const next = jest.fn();
        authenticate({ headers: { authorization: `Bearer ${tokenFor(CLIENT)}x` } }, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("attaches req.user and calls next for a valid token", () => {
        const req = { headers: { authorization: `Bearer ${tokenFor(CLIENT)}` } };
        const next = jest.fn();
        authenticate(req, mockRes(), next);
        expect(req.user).toEqual(CLIENT);
        expect(next).toHaveBeenCalled();
    });
});

describe("authorize", () => {
    test("allows a listed role", () => {
        const next = jest.fn();
        authorize("client", "contractor")({ user: CLIENT }, mockRes(), next);
        expect(next).toHaveBeenCalled();
    });

    test("rejects an unlisted role with 403", () => {
        const res = mockRes();
        const next = jest.fn();
        authorize("contractor")({ user: CLIENT }, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    test("rejects when no user is attached", () => {
        const res = mockRes();
        authorize("client")({}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
