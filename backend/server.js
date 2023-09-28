const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ALLOWED_ORIGIN,
    },
});

const corsOptions = {
    origin: ALLOWED_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

require("./sockets/reversi")(io);
require("./sockets/ticTacToeIo")(io);
require("./sockets/homeIo")(io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
