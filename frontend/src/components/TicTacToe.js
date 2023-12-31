import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

const TicTacToe = () => {
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

    const navigate = useNavigate();

    useEffect(() => {
        socket.emit("setSessionInfoTic", { roomId, session });
    }, []);

    useEffect(() => {
        socket.on("updateBoard", handleUpdateBoard);
        socket.on("sessionInfo", handleSessionInfo);
        socket.on("returnSessionInfo", handleReturnSessionInfo);
        socket.on("disconnectUsers", handleDisconnectUsers);
        socket.on("updateSessionRequest", () => {
            console.log("Received update session request");
            socket.emit("updateSessionInfo", { roomId, playerName });
        });

        return () => {
            socket.off("updateBoard", handleUpdateBoard);
            socket.off("sessionInfo", handleSessionInfo);
            socket.off("returnSessionInfo", handleReturnSessionInfo);
            socket.off("disconnectUsers", handleDisconnectUsers);
            socket.off("updateSessionRequest", handleReturnSessionInfo);
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
            console.log("player disconnected");
            // handleDisconnectUsers();
        }
    }, [sessionInfo]);

    useEffect(() => {
        const filledSquares = board.filter((square) => square !== null).length;
        setMovesMade(filledSquares);
    }, [board]);

    useEffect(() => {
        const timer = setTimeout(() => {
            socket.emit("Usertimeout", { roomId });
            console.log("State was not updated in 20 seconds");
            alert("Player was Inactive for too long");
            navigate("/");
        }, 30000);
        return () => clearTimeout(timer);
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

    const handleDisconnectUsers = () => {
        alert("Opponent Disconnected!");
        navigate("/");
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
                className="w-1/3 bg-slate-800 px-2 pb-4 font-sans  text-white relative aspect-square border-none text-8xl sm:text-9xl font-semibold flex items-center text-center justify-center"
                onClick={() => handleClick(index)}
            >
                {board[index]}
            </button>
        );
    };

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
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
            return "tie";
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
            </div>
        </div>
    );
};

export default TicTacToe;
