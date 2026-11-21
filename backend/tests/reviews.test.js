jest.mock("../models/reviewModel");
jest.mock("../models/projectModel");

const request = require("supertest");
const Review = require("../models/reviewModel");
const Project = require("../models/projectModel");
const { app } = require("../app");
const { bearer, CLIENT, CONTRACTOR, OTHER_CLIENT } = require("./helpers");

const completed = { id: 100, client_id: CLIENT.id, contractor_id: 10, status: "completed" };
const post = (user, body) => request(app).post("/api/reviews").set("Authorization", bearer(user)).send(body);

describe("POST /api/reviews", () => {
    beforeEach(() => {
        Project.getProjectById.mockResolvedValue(completed);
        Review.getReviewByProjectId.mockResolvedValue(undefined);
    });

    test("client reviews their completed project", async () => {
        Review.createReview.mockResolvedValue({ id: 1 });
        const res = await post(CLIENT, { project_id: 100, rating: "5", comment: "Great" });
        expect(res.status).toBe(201);
        expect(Review.createReview).toHaveBeenCalledWith(100, CLIENT.id, 10, 5, "Great");
    });

    test("contractors cannot leave reviews", async () => {
        const res = await post(CONTRACTOR, { project_id: 100, rating: 5 });
        expect(res.status).toBe(403);
    });

    test.each([0, 6, 3.5, "abc", undefined])("rejects rating %p", async (rating) => {
        const res = await post(CLIENT, { project_id: 100, rating });
        expect(res.status).toBe(400);
    });

    test("cannot review someone else's project", async () => {
        const res = await post(OTHER_CLIENT, { project_id: 100, rating: 4 });
        expect(res.status).toBe(403);
    });

    test("cannot review an unfinished project", async () => {
        Project.getProjectById.mockResolvedValue({ ...completed, status: "in_progress" });
        const res = await post(CLIENT, { project_id: 100, rating: 4 });
        expect(res.status).toBe(400);
    });

    test("cannot review the same project twice", async () => {
        Review.getReviewByProjectId.mockResolvedValue({ id: 1 });
        const res = await post(CLIENT, { project_id: 100, rating: 4 });
        expect(res.status).toBe(409);
        expect(Review.createReview).not.toHaveBeenCalled();
    });
});
