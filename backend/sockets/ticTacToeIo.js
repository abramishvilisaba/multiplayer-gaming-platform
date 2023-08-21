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

        socket.on("setSessionInfo", ({ roomId, session }) => {
            socket.join(roomId);

            if (session) {
                activeGameSessions.push(session);
                gameSessions[session.id] = session;
            }
        });

        socket.on("updateBoard", ({ roomId, board }) => {
            try {
                if (board) {
                    socket.join(roomId);
                    if (gameSessions[roomId] !== board) {
                        if (gameSessions[roomId].board) {
                            gameSessions[roomId].board = board;
                            io.sockets.in(roomId).emit("updateBoard", board);
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

        const SessionUpdateRequest = () => {
            _.forEach(gameSessions, (session, sessionId) => {
                io.to(sessionId).emit("updateSessionRequest");
            });
            console.log("start ==========");
            for (const sessionId in activeGameSessions) {
                console.log("sessionIds---------", sessionId);
                console.log(activeGameSessions[sessionId]);
                if (activeGameSessions[sessionId].players.length < 2) {
                    console.log("disconnectUsers", sessionId);
                    io.to(sessionId).emit("disconnectUsers");
                }
            }
        };

        // const sessionUpdateTimer = setInterval(SessionUpdateRequest, 10000);
        // sessionUpdateTimer;
        socket.on("disconnect", () => {
            // console.log("A user disconnected");
            // activeGameSessions.length = 0;
            // emitSessionUpdateRequest();
            // gameSessions.forEach((sessionId) => {
            //     const session = gameSessions[sessionId];
            //     session.players = session.players.filter((player) => player.socketId !== socket.id);
            //     if (session.players.length === 1) {
            //         delete gameSessions[sessionId];
            //         _.remove(activeGameSessions, sessionId);
            //         console.log("sessionId--------------", sessionId);
            //         io.to(sessionId).emit("disconnectUsers");
            //     }
            // });
        });
    });
};
