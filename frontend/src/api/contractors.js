import api from "./client";

export const createContractorProfile = (data) =>
    api.post("/api/contractors/profile", data).then((res) => res.data);

export const getContractorProfileByUserId = (userId) =>
    api.get(`/api/contractors/profile/user/${userId}`).then((res) => res.data);

export const getContractors = () =>
    api.get("/api/contractors").then((res) => res.data);

export const getContractorById = (id) =>
    api.get(`/api/contractors/${id}`).then((res) => res.data);
