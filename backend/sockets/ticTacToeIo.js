const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const _ = require("lodash");
const socketIo = require("socket.io");
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

app.use(cors());
app.use(express.json());

const gameSessions = {};

const activeGameSessions = [];
module.exports = (io) => {
    io.sockets.on("connection", async (socket) => {
        // console.log("A user connected to game");

        socket.on("setSessionInfo", ({ roomId, session }) => {
            socket.join(roomId);

            console.log("setSessionInfo", session);

            if (session) {
                gameSessions[session.id] = session;
                console.log("gameSessions", gameSessions);
            }
        });

        socket.on("updateBoard", ({ roomId, board }) => {
            try {
                if (board) {
                    console.log(roomId);
                    console.log(board);
                    socket.join(roomId);
                    console.log("updateBoard", board);
                    if (gameSessions[roomId] !== board) {
                        if (gameSessions[roomId].board) {
                            console.log(gameSessions[roomId]);
                            console.log(gameSessions[roomId].board);
                            gameSessions[roomId].board = board;
                            io.sockets.in(roomId).emit("updateBoard", board);
                            // socket.to(roomId).emit("updateBoard", board);
                        }
                    }
                }
            } catch (error) {
                console.log("error", error);
            }
        });

        // socket.on("disconnect", () => {
        //     console.log(playerName, existingSession);
        // });
    });
};
