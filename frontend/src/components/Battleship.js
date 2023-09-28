import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";

const headerLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const headerNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const numRows = 10;
const numCols = 10;

const cellStyle = {
    width: `${100 / 11}%`,
    aspectRatio: "1 / 1",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
    border: "1px solid #ccc",
    cursor: "pointer",
};

const headerCellStyle = {
    ...cellStyle,
    backgroundColor: "#333",
    color: "white",
};

const hitCellStyle = {
    ...cellStyle,
    backgroundColor: "#ff0000",
    color: "white",
};

const missCellStyle = {
    ...cellStyle,
    backgroundColor: "#00ff00",
    color: "white",
};

const BattleshipGrid = () => {
    const [grid, setGrid] = useState(Array(numRows).fill(Array(numCols).fill(null)));
    const [selectedShip, setSelectedShip] = useState(null);
    const [shipOrientation, setShipOrientation] = useState("vertical");
    const [hitCounter, setHitCounter] = useState(0);
    const [shipCounter, setShipCounter] = useState(0);
    const [allSet, setAllSet] = useState(false);
    const [ships, setShips] = useState([
        { id: 1, name: "Destroyer", length: 2, symbol: "D", isPlaced: false },
        { id: 2, name: "Cruiser", length: 3, symbol: "C", isPlaced: false },
    ]);

    useEffect(() => {
        console.log(shipCounter);

        if (shipCounter >= 7) {
            setAllSet(true);
        }
    }, [shipCounter]);

    console.log(allSet);

    const isShipPlacementValid = (ship, row, col) => {
        if (shipOrientation === "horizontal") {
            return col + ship.length <= numCols;
        } else {
            return row + ship.length <= numRows;
        }
    };

    const handleShipClick = (ship) => {
        const shipSymbol = `S${ship.symbol}`.slice(1);
        ship.isPlaced = false;
        console.log(ship);

        const updatedGrid = [...grid.map((rowArray) => [...rowArray])];
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (updatedGrid[row][col] === shipSymbol) {
                    updatedGrid[row][col] = null;
                }
            }
        }
        setGrid(updatedGrid);
        console.log(updatedGrid);
        setSelectedShip(ship);
    };

    const calculateStartPosition = (row, col, length) => {
        if (shipOrientation === "horizontal") {
            if (col + length > numCols) {
                col = numCols - length;
            }
            if (col >= 0) {
                return [row, col];
            }
        } else {
            if (row + length > numRows) {
                row = numRows - length;
            }
            if (row >= 0) {
                return [row, col];
            }
        }
        return null;
    };

    const handleCellClick = (row, col) => {
        if (selectedShip) {
            const length = selectedShip.length;
            const startPosition = calculateStartPosition(row, col, length);
            if (startPosition) {
                const updatedGrid = [...grid.map((rowArray) => [...rowArray])];

                for (let i = 0; i < length; i++) {
                    const newRow = startPosition[0] + (shipOrientation === "vertical" ? i : 0);
                    const newCol = startPosition[1] + (shipOrientation === "horizontal" ? i : 0);
                    updatedGrid[newRow][newCol] = selectedShip.symbol;
                    setShipCounter(shipCounter + 1);
                }

                console.log(updatedGrid);
                setGrid(updatedGrid);
                setSelectedShip(null);
                // Update the isPlaced property of the selected ship to true
                setShips((prevShips) =>
                    prevShips.map((ship) =>
                        ship.id === selectedShip.id ? { ...ship, isPlaced: true } : ship
                    )
                );
            } else {
                console.log("Invalid placement.");
            }
        } else {
            const updatedGrid = [...grid.map((rowArray) => [...rowArray])];

            if (updatedGrid[row][col] === null) {
                updatedGrid[row][col] = "M";
            } else {
                updatedGrid[row][col] = "H";
            }

            setGrid(updatedGrid);
        }
    };

    const isGameOver = () => {
        for (const ship of ships) {
            console.log(ship);

            if (ship.isPlaced) {
                const shipSymbol = `S${ship.symbol}`.slice(1);
                const shipCount = grid.flat().filter((cell) => cell === shipSymbol).length;
                if (shipCount !== ship.length) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    };

    return (
        <div style={{ textAlign: "center", margin: "16px", width: "100%" }}>
            <Typography variant="h5" style={{ marginBottom: 48, marginTop: 24 }}>
                Battleship Game
            </Typography>
            <Grid
                container
                component={Paper}
                elevation={3}
                style={{ borderCollapse: "collapse", width: "40%", margin: "0 auto" }}
            >
                <Grid item style={{ ...headerCellStyle }} />
                {headerLetters.map((letter, colIndex) => (
                    <Grid
                        item
                        key={letter}
                        style={{ ...headerCellStyle }}
                        droppableId={`header-${colIndex}`}
                    >
                        {letter}
                    </Grid>
                ))}
                {grid.map((row, rowIndex) => (
                    <Grid container item key={rowIndex}>
                        <Grid item style={{ ...headerCellStyle }}>
                            {headerNumbers[rowIndex]}
                        </Grid>
                        {row.map((cell, colIndex) => (
                            <Grid
                                item
                                key={colIndex}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                style={{
                                    ...cellStyle,
                                    ...(cell === "H"
                                        ? hitCellStyle
                                        : cell === "M"
                                        ? missCellStyle
                                        : cell && cell === "C"
                                        ? {
                                              backgroundColor: "blue",
                                              color: "white",
                                          }
                                        : {}),
                                }}
                            >
                                {cell && typeof cell === "number" ? ships[cell - 1].symbol : cell}
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>
            <div
                style={{
                    borderCollapse: "collapse",
                    width: "40%",
                    margin: "0 auto",
                    display: "flex",
                    direction: "row",
                    gap: "20px",
                }}
            >
                {ships.map((ship) => (
                    <div
                        key={ship.symbol}
                        onClick={() => handleShipClick(ship)}
                        style={{
                            width: `${(ship.length * 100) / numCols}%`,
                            aspectRatio: `${ship.length}/1`,
                            backgroundColor:
                                selectedShip?.id === ship.id
                                    ? "red"
                                    : grid.flat().includes(ship.symbol)
                                    ? "grey"
                                    : "blue",
                            color: "white",
                            textAlign: "center",
                            cursor: "pointer",
                            marginBottom: "8px",
                        }}
                    >
                        {ship.name} ({ship.length})
                    </div>
                ))}
                <button
                    onClick={() =>
                        setShipOrientation(
                            shipOrientation === "vertical" ? "horizontal" : "vertical"
                        )
                    }
                >
                    Change Orientation
                </button>
            </div>
            {isGameOver() && (
                <Typography variant="h6" style={{ marginTop: 16 }}>
                    Game Over! All ships are sunk.
                </Typography>
            )}
        </div>
    );
};

export default BattleshipGrid;
