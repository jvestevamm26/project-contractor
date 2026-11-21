const http = require("http");
const { Server } = require("socket.io");
const { app, FRONTEND_URL } = require("./app");
const { registerChatSocket } = require("./sockets/chatSocket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: FRONTEND_URL }
});

registerChatSocket(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
