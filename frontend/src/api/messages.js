import api from "./client";

export const getProjectMessages = (projectId) =>
    api.get(`/api/messages/project/${projectId}`).then((res) => res.data);
