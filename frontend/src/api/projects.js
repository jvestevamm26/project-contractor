import api from "./client";

export const getProjectById = (id) =>
    api.get(`/api/projects/${id}`).then((res) => res.data);

export const createProject = (data) =>
    api.post("/api/projects", data).then((res) => res.data);

export const getProjectsByClient = (clientId) =>
    api.get(`/api/projects/client/${clientId}`).then((res) => res.data);

export const getProjectsByContractor = (contractorId) =>
    api.get(`/api/projects/contractor/${contractorId}`).then((res) => res.data);

export const updateProjectStatus = (id, status) =>
    api.patch(`/api/projects/${id}/status`, { status }).then((res) => res.data);

export const getProjectImages = (id) =>
    api.get(`/api/projects/${id}/images`).then((res) => res.data);

export const uploadProjectImage = (id, file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api
        .post(`/api/projects/${id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
};
