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

function findSessionBySocket(socket) {
    console.log("findSessionBySocket");

    for (const roomId in gameSessions) {
        if (gameSessions.hasOwnProperty(roomId)) {
            const session = gameSessions[roomId];
            console.log("findSessionBySocket2");
            for (const playerName in playerSockets) {
                console.log("findSessionBySocket3");
                console.log(playerName);
                if (playerSockets[playerName] === socket) {
                    console.log("return");

                    return session;
                }
            }
        }
    }
    return null;
}

app.use(cors());
app.use(express.json());

const gameSessions = {};
const playerSockets = {};

const activeGameSessions = [];

console.log("gameSessions", gameSessions);

module.exports = (io) => {
    io.sockets.on("connection", async (socket) => {
        console.log("A user connected  to home");
        socket.emit("connected");
        // console.log(gameSessions);

        socket.on("getSessions", () => {
            console.log("getSessions");
            socket.emit("setSessions", gameSessions);
        });

        // socket.on("createOrJoinTicTacToe", ({ playerName }) => {
        //     const existingSession = findSessionWithOnePlayer();
        //     console.log(existingSession);

        //     if (existingSession) {
        //         if (existingSession.players.includes(playerName)) {
        //             socket.emit("playerAlreadyJoined");
        //         } else {
        //             existingSession.players.push(playerName);
        //             socket.join(existingSession.id);
        //             io.to(existingSession.id).emit("playerJoined", existingSession);
        //         }
        //     } else {
        //         const newSession = createNewSession(playerName);
        //         socket.join(newSession.id);
        //         socket.emit("gameSessionCreated", newSession);
        //     }
        // });
        socket.on("createOrJoinReversi", ({ playerName }) => {
            const existingSession = findSessionWithOnePlayer("Reversi");

            if (existingSession) {
                if (existingSession.players.includes(playerName)) {
                    socket.emit("playerAlreadyJoined");
                } else {
                    playerSockets[playerName] = socket;
                    existingSession.players.push(playerName);
                    socket.join(existingSession.id);
                    io.to(existingSession.id).emit("playerJoined", existingSession);
                }
            } else {
                const newSession = createNewSession(playerName, "Reversi");
                socket.join(newSession.id);
                socket.emit("gameSessionCreated", newSession);
                playerSockets[playerName] = socket;
                setSessions();
            }
        });

        socket.on("joinReversi", ({ playerName, session }) => {
            console.log("JoinReversi");
            console.log("playerName", playerName);
            // console.log("session", session);

            const existingSession = session;

            if (existingSession) {
                if (existingSession.players.includes(playerName)) {
                    socket.emit("playerAlreadyJoined");
                } else {
                    playerSockets[playerName] = socket;
                    existingSession.players.push(playerName);
                    // console.log(existingSession);
                    gameSessions[existingSession.id] = existingSession;
                    socket.join(existingSession.id);
                    setSessions();
                    io.to(existingSession.id).emit("playerJoined", existingSession);
                }
            }
        });

        socket.on("createOrJoinTicTacToe", ({ playerName }) => {
            // const existingSession = findSessionWithOnePlayer("TicTacToe");

            // if (existingSession) {
            //     if (existingSession.players.includes(playerName)) {
            //         socket.emit("playerAlreadyJoined");
            //     } else {
            //         playerSockets[playerName] = socket;
            //         existingSession.players.push(playerName);
            //         socket.join(existingSession.id);
            //         io.to(existingSession.id).emit("playerJoined", existingSession);
            //     }
            // } else {

            const newSession = createNewSession(playerName, "TicTacToe");
            socket.join(newSession.id);
            socket.emit("gameSessionCreated", newSession);
            playerSockets[playerName] = socket;
            console.log(gameSessions);
            setSessions();
            // }
        });

        socket.on("joinTicTacToe", ({ playerName, session }) => {
            console.log("JoinTicTacToe");
            console.log("playerName", playerName);
            // console.log("session", session);

            const existingSession = session;

            if (existingSession) {
                if (existingSession.players.includes(playerName)) {
                    socket.emit("playerAlreadyJoined");
                } else {
                    playerSockets[playerName] = socket;
                    existingSession.players.push(playerName);
                    // console.log(existingSession);
                    gameSessions[existingSession.id] = existingSession;
                    socket.join(existingSession.id);
                    setSessions();
                    io.to(existingSession.id).emit("playerJoined", existingSession);
                }
            }
        });

        socket.on("getSessionInfo", ({ roomId }) => {
            // console.log(gameSessions);

            const session = gameSessions[roomId];
            socket.join(roomId);

            if (session) {
                io.to(roomId).emit("returnSessionInfo", session);
            }
        });

        function emitSessionInfoToRoom(roomId, session) {
            io.to(roomId).emit("sessionInfo", session);
        }

        function createNewSession(playerName, game) {
            const roomId = uuidv4();
            const session = {
                id: roomId,
                players: [playerName],
                playerSockets: {},
            };
            gameSessions[roomId] = session;
            gameSessions[roomId].board = [];
            gameSessions[roomId].game = game;
            return session;
        }

        function setSessions() {
            console.log("setSessions");
            io.emit("setSessions", gameSessions);
        }

        function findSessionWithOnePlayer(game) {
            return _.find(
                gameSessions,
                (session) => session.players.length === 1 && session.game === game
            );
        }

        function generateRandomRoomId() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            const length = 6;
            return _.times(length, () => _.sample(characters)).join("");
        }
    });
};
