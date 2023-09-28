import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import _ from "lodash";
import { useNavigate } from "react-router-dom";

const cellStyle = {
    width: `${100 / 8}%`,
    aspectRatio: "1 / 1",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
    border: "1px solid #000",
    cursor: "pointer",
};
const BlackCircle = () => {
    const blackCircleStyle = {
        backgroundColor: "black",
        borderRadius: "50%",
        width: "80%",
        height: "80%",
        margin: "auto",
    };

    return <div style={blackCircleStyle}></div>;
};

const WhiteCircle = () => {
    const whiteCircleStyle = {
        backgroundColor: "white",
        borderRadius: "50%",
        width: "80%",
        height: "80%",
        margin: "auto",
    };

    return <div style={whiteCircleStyle}></div>;
};

const API_URL = process.env.REACT_APP_API_URL;
const socket = io(API_URL);

export default function Reversi() {
    function initializeBoard() {
        const board = Array(8)
            .fill(null)
            .map(() => Array(8).fill(null));
        board[3][3] = "W";
        board[3][4] = "B";
        board[4][3] = "B";
        board[4][4] = "W";
        const clickedCells = [];
        clickedCells.push("3-3", "3-4", "4-3", "4-4");
        return { board, clickedCells };
    }

    const { state } = useLocation();
    const { id, name, session } = state;

    const { board: initialBoard, clickedCells: initialClickedCells } = initializeBoard();
    const [board, setBoard] = useState(initialBoard);
    const [isWhiteTurn, setIsWhiteTurn] = useState(true);
    const [clickedCells, setClickedCells] = useState(initialClickedCells);

    const [playerName, setPlayerName] = useState(name);
    const [roomId, setRoomId] = useState(id);
    const [errorMessage, setErrorMessage] = useState("");
    const [sessionInfo, setSessionInfo] = useState(session);
    const [isNext, setisNext] = useState(false);
    const [move, setMove] = useState("");
    const [movesMade, setMovesMade] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        socket.emit("setSessionInfoRev", { roomId, session });
    }, []);

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
        const filledSquares = board.filter((square) => square !== null).length;
        setMovesMade(filledSquares);
    }, [board]);

    useEffect(() => {
        const playerIndex = sessionInfo.players.indexOf(playerName);
        if (playerIndex !== -1) {
            setMove(playerIndex === 0 ? "White" : "Black");
            setisNext(playerIndex === 0);
            socket.emit("updateBoard", { roomId, board });
        }

        if (sessionInfo && sessionInfo.players.length < 2) {
            console.log("player disconnected");
        }
    }, []);

    useEffect(() => {
        socket.on("updateBoard", handleUpdateBoard);

        return () => {
            socket.off("updateBoard", handleUpdateBoard);
        };
    }, []);

    const capturePieces = (row, col, newBoard) => {
        const currentPlayer = newBoard[row][col];
        const opponent = currentPlayer === "B" ? "W" : "B";

        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];

        for (const [dx, dy] of directions) {
            let x = row + dx;
            let y = col + dy;
            let foundOpponent = false;

            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                if (newBoard[x][y] === opponent) {
                    foundOpponent = true;
                } else if (newBoard[x][y] === currentPlayer && foundOpponent) {
                    // Flip opponent's pieces between (row, col) and (x, y)
                    let i = row + dx;
                    let j = col + dy;

                    while (i !== x || j !== y) {
                        newBoard[i][j] = currentPlayer;
                        i += dx;
                        j += dy;
                    }

                    break;
                } else {
                    break;
                }

                x += dx;
                y += dy;
            }
        }

        return newBoard;
    };

    const handleUpdateBoard = (updatedBoard, newClickedCells, name) => {
        if (_.toString(updatedBoard).length !== _.toString(board).length) {
            setBoard(updatedBoard);
            setClickedCells(newClickedCells);
            console.log("isnext");
            setisNext(playerName !== name);
        }
    };

    const handleMove = (row, col) => {
        if (isValidMove(row, col) && !cellIsClicked(row, col)) {
            const playerIndex = sessionInfo.players.indexOf(playerName);

            const newBoard = [...board];
            newBoard[row][col] = playerIndex === 0 ? "W" : "B";
            const updatedBoard = capturePieces(row, col, newBoard);
            const newClickedCells = [...clickedCells];
            newClickedCells.push(`${row}-${col}`);
            setClickedCells(newClickedCells);
            setBoard(updatedBoard);
            setIsWhiteTurn(!isWhiteTurn);
            setisNext(false);
            socket.emit("updateBoard", {
                roomId,
                board: updatedBoard,
                clickedCells: newClickedCells,
                playerName,
            });
        }
    };

    const isValidMove = (row, col) => {
        if (isNext && !board[row][col] && cellBorderedBySelectedPiece(row, col)) {
            return true;
        } else {
            return false;
        }
    };

    const cellBorderedBySelectedPiece = (row, col) => {
        const adjacentCells = [
            [row - 1, col - 1],
            [row - 1, col],
            [row - 1, col + 1],
            [row, col - 1],
            [row, col + 1],
            [row + 1, col - 1],
            [row + 1, col],
            [row + 1, col + 1],
        ];

        for (const [adjRow, adjCol] of adjacentCells) {
            if (isValidCoordinate(adjRow, adjCol) && cellIsClicked(adjRow, adjCol)) {
                return true;
            }
        }

        return false;
    };

    const cellIsClicked = (row, col) => {
        return clickedCells.includes(`${row}-${col}`);
    };

    const isValidCoordinate = (row, col) => {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    };

    const renderCellContent = (cell) => {
        if (cell === "B") {
            return <BlackCircle />;
        } else if (cell === "W") {
            return <WhiteCircle />;
        } else {
            return null;
        }
    };

    const countBlackPieces = (board) => {
        let count = 0;
        for (const row of board) {
            for (const cell of row) {
                if (cell === "B") {
                    count++;
                }
            }
        }
        return count;
    };

    const countWhitePieces = (board) => {
        let count = 0;
        for (const row of board) {
            for (const cell of row) {
                if (cell === "W") {
                    count++;
                }
            }
        }
        return count;
    };

    // const blackPieceCount = countBlackPieces(board);
    // const whitePieceCount = countWhitePieces(board);

    return (
        <div
            style={{
                textAlign: "center",
                width: "100%",
                paddingTop: "6vh",
                paddingBottom: "32vh",
                backgroundColor: "slategray",
            }}
        >
            <Typography variant="h5" style={{ marginBottom: 24, marginTop: 12 }}>
                Reversi Game
            </Typography>

            {countBlackPieces(board) + countWhitePieces(board) === 64 ? (
                <div className="turn" style={{ marginBottom: 12, fontSize: "22px" }}>
                    Game Over
                </div>
            ) : (
                <div className="turn" style={{ marginBottom: 12 }}>
                    {isNext ? "Your" : "Opponent's"} Turn
                </div>
            )}
            <div
                style={{
                    display: "flex",
                    direction: "row",
                    justifyContent: "center",
                    gap: "40px",
                }}
            >
                <div className="turn" style={{ marginBottom: 12 }}>
                    black Pieces : {countBlackPieces(board)}
                </div>
                <div className="turn" style={{ marginBottom: 12 }}>
                    white Pieces : {countWhitePieces(board)}
                </div>
            </div>

            <Grid
                container
                component={Paper}
                elevation={3}
                style={{
                    borderCollapse: "collapse",
                    width: "40%",
                    height: "fit",
                    margin: "0 auto",
                }}
            >
                <div className="board" style={{ width: "100%", backgroundColor: "#638EA0" }}>
                    {board.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="row"
                            style={{ display: "flex", direction: "row" }}
                        >
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    className="cell"
                                    onClick={() => handleMove(rowIndex, colIndex)}
                                    style={{
                                        ...cellStyle,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    {renderCellContent(cell)}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Grid>
        </div>
    );
}
