const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const activeGameSessions = [];

app.post("/createGameSession", (req, res) => {
    const { playerName } = req.body;
    const session = {
        id: activeGameSessions.length + 1,
        players: [playerName],
        // Add other session-related properties here
    };
    activeGameSessions.push(session);
    res.json(session);
});

app.post("/joinGameSession", (req, res) => {
    const { sessionId, playerName } = req.body;
    const session = activeGameSessions.find((session) => session.id === sessionId);
    if (session) {
        session.players.push(playerName);
        // Handle game setup and start here
        res.json({ message: "Joined game session" });
    } else {
        res.status(404).json({ message: "Session not found" });
    }
});

// Add more routes for game actions, such as making moves

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
