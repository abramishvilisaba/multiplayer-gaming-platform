import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import _ from "lodash";

export default function TikTakToe() {
    const [playerName, setPlayerName] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [sessionInfo, setSessionInfo] = useState(null);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isNext, setisNext] = useState(false);
    const [move, setMove] = useState("");
    const [movesMade, setMovesMade] = useState(0);

    const API_URL = process.env.REACT_APP_API_URL;
    const { state } = useLocation();
    const { id, name, session } = state;
    console.log(session);

    useEffect(() => {
        setSessionInfo(session);
        setRoomId(id);
        setPlayerName(name);
        socket.emit("setSessionInfo", { roomId, session });
    }, []);

    const socket = io(API_URL);

    const playGame = () => {
        console.log("play");
        console.log(board);
        socket.emit("getSessionInfo", { roomId });
        socket.on("returnSessionInfo", (session) => {
            console.log("returnSessionInfo");
            console.log("returnSessionInfo", session);
            console.log("session.players.length", session.players.length);
            session.players.length > 1 ? setSessionInfo(session) : null;
        });
    };

    const handleClick = (index) => {
        if (winner) {
            console.log("winnnnnnnnnn");
            setBoard(Array(9).fill(null));
            setMovesMade(0);
            return;
        }
        console.log("isNext", isNext);
        if (board[index] || !isNext) {
            return;
        }

        const newBoard = [...board];
        newBoard[index] = isNext ? move : null;

        setBoard(newBoard);
        socket.emit("updateBoard", { roomId, board: newBoard });

        // playGame();
    };

    const winningCombinations = [
        [0, 1, 2], // Top row
        [3, 4, 5], // Middle row
        [6, 7, 8], // Bottom row
        [0, 3, 6], // Left column
        [1, 4, 7], // Middle column
        [2, 5, 8], // Right column
        [0, 4, 8], // Diagonal from top-left to bottom-right
        [2, 4, 6], // Diagonal from top-right to bottom-left
    ];

    const calculateWinner = (board) => {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const winner = calculateWinner(board);

    useEffect(() => {
        if (sessionInfo && movesMade === 0) {
            if (sessionInfo.players[0] === playerName) {
                setMove("X");
                setisNext(true);
            } else if (sessionInfo.players[1] === playerName) {
                setMove("O");
                setisNext(false);
            }
            console.log("updateBoard");
            if (sessionInfo) socket.emit("updateBoard", { roomId, board });
        }

        socket.on("updateBoard", (updatedBoard) => {
            if (_.toString(updatedBoard).length !== _.toString(board).length) {
                console.log("useEffectUpdate");
                console.log(updatedBoard, board);
                console.log("isNext", isNext);
                setBoard(updatedBoard);
            }
        });
    }, [sessionInfo]);

    useEffect(() => {
        const length = _.toString(board).length;
        console.log(board, length);
        setMovesMade((44 - length) / 3);
        console.log("setmoves");
        console.log("movesMade", movesMade);
        console.log("isNext", isNext);
    }, [board]);

    useEffect(() => {
        if (movesMade % 2 === 0) {
            if (move === "X") {
                console.log("setXtrue=======");
                setisNext(true);
            } else if (move === "O") {
                setisNext(false);
            }
        } else if (movesMade % 2 === 1) {
            if (move === "O") {
                console.log("setOtrue=======");
                setisNext(true);
            } else if (move === "X") {
                setisNext(false);
            }
        }
    }, [movesMade]);

    useEffect(() => {
        socket.on("updateBoard", (updatedBoard) => {
            console.log("useEffectUpdate");
            setBoard(updatedBoard);
            if (updatedBoard !== board) {
                setBoard(updatedBoard);
                // setMovesMade(movesMade + 1);
            }
        });

        socket.on("gameSessionCreated", (session) => {
            console.log("gameSessionCreated", session.id);
            setRoomId(session.id);
            setErrorMessage("");
        });

        socket.on("playerJoined", (session) => {
            console.log("playerJoined", session.id);
            setRoomId(session.id);
            setErrorMessage("");
        });

        socket.on("roomFull", () => {
            setErrorMessage("Room is already full");
        });

        socket.on("game started", () => {
            console.log("play");
        });

        socket.on("sessionInfo", (session) => {
            console.log("players", session.players);
            setSessionInfo(session);
        });

        socket.on("returnSessionInfo", (session) => {
            console.log("returnSessionInfo");
            console.log("returnSessionInfo", session);
            session.players.length > 1 ? setSessionInfo(session) : null;
        });
    }, []);

    const renderSquare = (index) => {
        return (
            <button
                className="w-1/3 bg-slate-800  text-white relative aspect-square border-none text-9xl font-semibold flex items-center text-center justify-center"
                onClick={() => handleClick(index)}
            >
                {board[index]}
            </button>
        );
    };

    console.log("movesMade", movesMade);

    return (
        <div className="flex flex-col w-screen h-screen text-center items-center  justify-center bg-slate-800 text-white text-2xl">
            <div className="flex content-center justify-center">
                {sessionInfo ? (
                    <div className="w-screen h-1/2 mx-auto max-w-md text-center ">
                        <div className="mb-4 font-semibold text-xl">{/* {status} */}</div>
                        <p className="mb-4">
                            {winner !== null
                                ? move === winner
                                    ? "You Win"
                                    : "Opponent Wins"
                                : isNext
                                ? "Your Turn "
                                : "Opponents Turn"}
                        </p>
                        <p className="mb-16">
                            {winner !== null ? "Click the table to restart" : null}
                        </p>
                        <div className="flex flex-col mb-8 gap-2 bg-white">
                            <div className="flex gap-2  items-center text-center justify-center">
                                {renderSquare(0)}
                                {renderSquare(1)}
                                {renderSquare(2)}
                            </div>
                            <div className="flex gap-2">
                                {renderSquare(3)}
                                {renderSquare(4)}
                                {renderSquare(5)}
                            </div>
                            <div className="flex gap-2">
                                {renderSquare(6)}
                                {renderSquare(7)}
                                {renderSquare(8)}
                            </div>
                        </div>
                        <p className="mb-8">
                            {session.players
                                ? session.players[0] + ": X " + session.players[1] + ": O "
                                : null}
                        </p>
                    </div>
                ) : null}

                {/*  */}
            </div>
        </div>
    );
}
