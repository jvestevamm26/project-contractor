import api from "./client";

export const getReviewsByContractor = (contractorId) =>
    api.get(`/api/reviews/contractor/${contractorId}`).then((res) => res.data);

export const createReview = (data) =>
    api.post("/api/reviews", data).then((res) => res.data);
