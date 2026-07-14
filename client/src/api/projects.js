import api from "./client";

export const getProjectById = (id) =>
    api.get(`/api/projects/${id}`).then((res) => res.data);

export const createProject = (data) =>
    api.post("/api/projects", data).then((res) => res.data);
