const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const _ = require("lodash");
const socketIo = require("socket.io");

require("dotenv").config();

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const PORT = process.env.PORT || 3001;
console.log(ALLOWED_ORIGIN);
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
        console.log("A user connected to home");
        console.log(gameSessions);

        socket.on("createOrJoinGame", ({ playerName }) => {
            const existingSession = findSessionWithOnePlayer();
            console.log(existingSession);

            if (existingSession) {
                if (existingSession.players.includes(playerName)) {
                    socket.emit("playerAlreadyJoined");
                } else {
                    existingSession.players.push(playerName);
                    socket.join(existingSession.id);
                    io.to(existingSession.id).emit("playerJoined", existingSession);
                }
            } else {
                const newSession = createNewSession(playerName);
                socket.join(newSession.id);
                socket.emit("gameSessionCreated", newSession);
            }
        });

        socket.on("getSessionInfo", ({ roomId }) => {
            const session = gameSessions[roomId];
            socket.join(roomId);

            if (session) {
                io.to(roomId).emit("returnSessionInfo", session);
            }
        });

        function emitSessionInfoToRoom(roomId, session) {
            io.to(roomId).emit("sessionInfo", session);
        }

        function createNewSession(playerName) {
            // const roomId = generateRandomRoomId();
            const roomId = uuidv4();
            const session = {
                id: roomId,
                players: [playerName],
                playerSockets: [],
            };
            gameSessions[roomId] = session;
            gameSessions[roomId].board = [];
            return session;
        }

        function findSessionWithOnePlayer() {
            return _.find(gameSessions, (session) => session.players.length === 1);
        }

        function generateRandomRoomId() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            const length = 6;
            return _.times(length, () => _.sample(characters)).join("");
        }
    });
};
