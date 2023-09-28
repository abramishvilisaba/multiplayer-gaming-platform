import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import TicTacToe from "./components/TicTacToe";
import Battleship from "./components/Battleship";
import Reversi from "./components/Reversi";

import { CssBaseline, IconButton, Typography, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { theme, lightTheme, darkTheme } from "./theme";
export default function App() {
    const [themeMode, setThemeMode] = useState("light");
    const toggleTheme = () => {
        setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };

    return (
        <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
            <CssBaseline />
            {/* <Box sx={{ textAlign: "end", mr: 4, mt: 1 }}>
                <IconButton onClick={toggleTheme} sx={{ m: 1 }}>
                    <Brightness4Icon fontSize="large" />
                </IconButton>
                <Typography variant="body" sx={{ fontSize: "20px" }}>
                    {themeMode === "light" ? "Light Theme" : "Dark Theme"}
                </Typography>
            </Box> */}
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/TicTacToe" element={<TicTacToe />} />
                    <Route path="/battleship" element={<Battleship />} />
                    <Route path="/Reversi" element={<Reversi />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
