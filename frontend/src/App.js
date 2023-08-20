import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import TikTakToe from "./components/TikTakToe";

function App() {
    return (
        <Routes>
            <Route exact path="/" component={Home} />
            <Route path="/snake-game" component={TikTakToe} />
        </Routes>
    );
}

export default App;
