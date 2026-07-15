import api from "./client";

export const getServices = () =>
    api.get("/api/services").then((res) => res.data);

export const getServiceById = (id) =>
    api.get(`/api/services/${id}`).then((res) => res.data);

export const createService = (data) =>
    api.post("/api/services", data).then((res) => res.data);

export const getServicesByContractor = (contractorId) =>
    api.get(`/api/services/contractor/${contractorId}`).then((res) => res.data);
