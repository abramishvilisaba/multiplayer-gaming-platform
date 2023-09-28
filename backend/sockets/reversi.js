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
        console.log("A user connected to game");

        socket.on("setSessionInfoRev", ({ roomId, session }) => {
            socket.join(roomId);
            console.log("===================================");

            console.log("setSessionInfoRev");

            if (session) {
                activeGameSessions.push(session);
                gameSessions[session.id] = session;
            }
        });

        socket.on("updateBoard", ({ roomId, board, clickedCells, playerName }) => {
            try {
                if (board) {
                    socket.join(roomId);
                    if (gameSessions[roomId] !== board) {
                        if (gameSessions[roomId].board) {
                            gameSessions[roomId].board = board;
                            console.log("newMove ==== ", playerName);
                            console.log("clickedCells ==== ", clickedCells);
                            let name = playerName;
                            let newClickedCells = clickedCells;

                            io.sockets.in(roomId).emit("updateBoard", board, newClickedCells, name);
                        }
                    }
                }
            } catch (error) {
                console.log("error", error);
            }
        });

        socket.on("updateSessionInfo", ({ roomId, playerName }) => {
            activeGameSessions.length = 0;

            if (roomId && playerName) {
                if (!activeGameSessions[roomId]) {
                    activeGameSessions[roomId] = { players: [] };
                }
                if (!activeGameSessions[roomId].players.includes(playerName)) {
                    activeGameSessions[roomId].players.push(playerName);
                }
                console.log("activeGameSessions", activeGameSessions);
            }
        });
        socket.on("UserTimeout", ({ roomId }) => {
            if (roomId) {
                delete gameSessions[roomId];
            }
        });

        socket.on("disconnect", () => {});
    });
};
