import { useEffect, useState } from "react";
import Piece, { Type, Team } from "../ts/Chesspiece";
import "../CSS/Chessboard.css";

const Chessboard = () => {
    const [board, setBoard] = useState([
        [
            new Piece(Type.R, Team.B),
            new Piece(Type.N, Team.B),
            new Piece(Type.B, Team.B),
            new Piece(Type.Q, Team.B),
            new Piece(Type.K, Team.B),
            new Piece(Type.B, Team.B),
            new Piece(Type.N, Team.B),
            new Piece(Type.R, Team.B),
        ],
        new Array(8).fill(new Piece(Type.P, Team.B)),
        new Array(8).fill(undefined),
        new Array(8).fill(undefined),
        new Array(8).fill(undefined),
        new Array(8).fill(undefined),
        new Array(8).fill(new Piece(Type.P, Team.W)),
        [
            new Piece(Type.R, Team.W),
            new Piece(Type.N, Team.W),
            new Piece(Type.B, Team.W),
            new Piece(Type.Q, Team.W),
            new Piece(Type.K, Team.W),
            new Piece(Type.B, Team.W),
            new Piece(Type.N, Team.W),
            new Piece(Type.R, Team.W),
        ],
    ]);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    useEffect(() => {
        console.log(from, to);
    }, [from, to]);

    return (
        <div className="chessboard">
            {board.map((row: Array<Piece>, x: number) => {
                return (
                    <div className="row" key={x}>
                        {row.map((s: Piece, y: number) => {
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
                                    {s && (
                                        <img
                                            src={require("../assets/" +
                                                Team[s.getTeam()] +
                                                Type[s.getType()] +
                                                ".svg")}
                                        />
                                    )}
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
