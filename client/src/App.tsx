import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "./Components/Game";
import Home from "./Components/Home";
import "./App.css";

export default function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game/:id" element={<Game />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
