import api from "./client";

export const registerUser = (data) =>
    api.post("/api/users/register", data).then((res) => res.data);

export const loginUser = (data) =>
    api.post("/api/users/login", data).then((res) => res.data);
