import { useState } from "react";
import "../CSS/Chessboard.css";

const Chessboard = () => {
    const temp = new Array(8);
    for (let i = 0; i < 8; i++) {
        temp[i] = new Array(8).fill("");
    }
    const [board, setBoard] = useState(temp);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    return (
        <div className="chessboard">
            {board.map((row: Array<string>, x: number) => {
                return (
                    <div className="row" key={x}>
                        {row.map((s: string, y: number) => {
                            return (
                                <div
                                    className={`square ${
                                        (x + y) % 2 === 0 ? "white" : "black"
                                    }`}
                                    key={`${y}${x}`}
                                    onMouseDown={() => {
                                        setFrom(`${y}${x}`);
                                    }}
                                    onMouseUp={() => {
                                        setTo(`${y}${x}`);
                                    }}
                                >
                                    {s}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default Chessboard;
