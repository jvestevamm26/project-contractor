import api from "./client";

export const askAssistant = (messages) =>
    api.post("/api/ai/ask", { messages }).then((res) => res.data);
