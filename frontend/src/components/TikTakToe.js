import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import _ from "lodash";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

const TikTakToe = () => {
    const { state } = useLocation();
    const { id, name, session } = state;

    const [playerName, setPlayerName] = useState(name);
    const [roomId, setRoomId] = useState(id);
    const [errorMessage, setErrorMessage] = useState("");
    const [sessionInfo, setSessionInfo] = useState(session);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isNext, setisNext] = useState(false);
    const [move, setMove] = useState("");
    const [movesMade, setMovesMade] = useState(0);

    useEffect(() => {
        socket.emit("setSessionInfo", { roomId, session });
    }, []);

    useEffect(() => {
        socket.on("updateBoard", handleUpdateBoard);
        socket.on("sessionInfo", handleSessionInfo);
        socket.on("returnSessionInfo", handleReturnSessionInfo);

        return () => {
            socket.off("updateBoard", handleUpdateBoard);
            socket.off("sessionInfo", handleSessionInfo);
            socket.off("returnSessionInfo", handleReturnSessionInfo);
        };
    }, []);
    //

    console.log("movesMade", movesMade);

    console.log("isNext", isNext);

    //
    useEffect(() => {
        if (sessionInfo && movesMade === 0) {
            const playerIndex = sessionInfo.players.indexOf(playerName);
            console.log("sessionInfouseEffect", playerIndex);

            if (playerIndex !== -1) {
                setMove(playerIndex === 0 ? "X" : "O");
                setisNext(playerIndex === 0);
                socket.emit("updateBoard", { roomId, board });
            }
        }

        if (sessionInfo && sessionInfo.players.length < 2) {
            console.log("player Disconnected");
        }
    }, [sessionInfo]);

    useEffect(() => {
        const filledSquares = board.filter((square) => square !== null).length;
        setMovesMade(filledSquares);
    }, [board]);

    useEffect(() => {
        const playerIndex = sessionInfo.players.indexOf(playerName);
        if (movesMade % 2 === (playerIndex === 0 ? 0 : 1)) {
            setisNext(true);
        } else {
            setisNext(false);
        }
    }, [movesMade, sessionInfo, playerName]);

    const handleUpdateBoard = (updatedBoard) => {
        if (_.toString(updatedBoard).length !== _.toString(board).length) {
            setBoard(updatedBoard);
        }
    };

    const handleSessionInfo = (receivedSession) => {
        setSessionInfo(receivedSession);
    };

    const handleReturnSessionInfo = (receivedSession) => {
        if (receivedSession.players.length > 1) {
            setSessionInfo(receivedSession);
        }
    };

    const handleClick = (index) => {
        if (winner) {
            setBoard(Array(9).fill(null));
            setMovesMade(0);
            return;
        }
        if (board[index] || !isNext) {
            return;
        }

        const newBoard = [...board];
        newBoard[index] = isNext ? move : null;
        setBoard(newBoard);
        socket.emit("updateBoard", { roomId, board: newBoard });
    };

    const renderSquare = (index) => {
        return (
            <button
                className="w-1/3 bg-slate-800 px-2 pb-4  text-white relative aspect-square border-none text-8xl sm:text-9xl font-semibold flex items-center text-center justify-center"
                onClick={() => handleClick(index)}
            >
                {board[index]}
            </button>
        );
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
        const filledSquares = _.filter(board, (square) => square !== null).length;
        if (filledSquares === 9) {
            return "tie"; // It's a tie
        }

        return null;
    };

    const winner = calculateWinner(board);

    // console.log(winner);

    return (
        <div className="flex flex-col w-screen h-screen text-center items-center  justify-center bg-slate-800 text-white text-2xl">
            <div className="flex content-center justify-center">
                {sessionInfo ? (
                    <div className="w-screen h-1/2 mx-auto max-w-md text-center ">
                        <div className="mb-4 font-semibold text-xl">{/* {status} */}</div>
                        <p className="mb-4">
                            {winner !== null
                                ? move === winner
                                    ? "You Win!"
                                    : winner === "tie"
                                    ? "Tie!"
                                    : "Opponent Wins!"
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
};

export default TikTakToe;
