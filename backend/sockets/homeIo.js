const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");

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

        socket.on("createOrJoinGame", ({ playerName }) => {
            const existingSession = findSessionWithOnePlayer();
            console.log(existingSession);

            if (existingSession) {
                if (existingSession.players.includes(playerName)) {
                    // Player has already joined this session
                    socket.emit("playerAlreadyJoined");
                } else {
                    existingSession.players.push(playerName);
                    socket.join(existingSession.id);
                    console.log("playerJoined", existingSession.id);
                    io.to(existingSession.id).emit("playerJoined", existingSession);
                    // socket.emit("playerJoined", existingSession);
                }
            } else {
                const newSession = createNewSession(playerName);
                socket.join(newSession.id);
                console.log("gameSessionCreated", newSession);
                socket.emit("gameSessionCreated", newSession);
            }
        });

        socket.on("getSessionInfo", ({ roomId }) => {
            console.log("getroomid", roomId);
            const session = gameSessions[roomId];
            socket.join(roomId);
            console.log(gameSessions);
            console.log("getSessionInfo", session);
            // console.log(roomId);

            if (session) {
                // console.log("returnSessionInfo", session);
                io.to(roomId).emit("returnSessionInfo", session);
            }
        });

        function emitSessionInfoToRoom(roomId, session) {
            io.to(roomId).emit("sessionInfo", session);
        }

        function createNewSession(playerName) {
            const roomId = generateRandomRoomId();
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
            // console.log("generateRandomRoomId");
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            const length = 6; // You can adjust the length of the room name here
            return _.times(length, () => _.sample(characters)).join("");
        }
    });
};
