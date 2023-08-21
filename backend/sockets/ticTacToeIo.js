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
        console.log("A user connected");

        // socket.on("createOrJoinGame", ({ playerName }) => {
        //     const existingSession = findSessionWithOnePlayer();
        //     console.log(existingSession);

        //     if (existingSession) {
        //         existingSession.players.push(playerName);
        //         socket.join(existingSession.id);
        //         console.log("playerJoined", existingSession.id);
        //         io.to(existingSession.id).emit("playerJoined", existingSession);
        //         // socket.emit("playerJoined", existingSession);
        //     } else {
        //         const newSession = createNewSession(playerName);
        //         socket.join(newSession.id);
        //         console.log("gameSessionCreated", newSession);
        //         socket.emit("gameSessionCreated", newSession);
        //     }
        // });

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

        function emitSessionInfoToRoom(roomId, session) {
            io.to(roomId).emit("sessionInfo", session);
        }

        function createNewSession(playerName) {
            const roomId = generateRandomRoomId();
            const session = {
                id: roomId,
                players: [playerName],
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

    // server.listen(PORT, () => {
    //     console.log(`Server is running on port ${PORT}`);
    // });
};
