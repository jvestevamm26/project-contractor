import api from "./client";

export const createContractorProfile = (data) =>
    api.post("/api/contractors/profile", data).then((res) => res.data);

export const getContractorProfileByUserId = (userId) =>
    api.get(`/api/contractors/profile/user/${userId}`).then((res) => res.data);
