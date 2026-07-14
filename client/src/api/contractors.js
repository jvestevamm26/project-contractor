import api from "./client";

export const createContractorProfile = (data) =>
    api.post("/api/contractors/profile", data).then((res) => res.data);
