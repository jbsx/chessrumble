import { useEffect, useState } from "react";
import Piece, { Type, Team } from "../ts/Chesspiece";
import "../CSS/Chessboard.css";

const Chessboard = (props: any) => {
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
    const [team, setTeam] = useState("white");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    useEffect(() => {
        console.log(from, to);
    }, [from, to]);

    useEffect(() => {
        if (props.team == "black") flipBoard();
    }, [props.team]);

    const flipBoard = () => {
        let buf = [...board];
        for (let i = 0; i < 4; i++) {
            const temp = buf[i];
            buf[i] = buf[7 - i];
            buf[7 - i] = temp;
        }
        buf.forEach((row) => {
            for (let i = 0; i < 8; i++) {
                const temp = row[i];
                row[i] = row[7 - i];
                row[7 - i] = temp;
            }
        });
        setBoard(buf);
        setTeam(team == "white" ? "black" : "white");
    };

    return (
        <div className="chessboard">
            {board.map((row: Array<Piece>, x: number) => {
                return (
                    <div className="row" key={x}>
                        {row.map((s: Piece, y: number) => {
                            return (
                                <div
                                    className={`square ${
                                        (x + y) % 2 ===
                                        (team == "black" ? 1 : 0)
                                            ? "white"
                                            : "black"
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
            <button
                onClick={() => {
                    flipBoard();
                }}
            >
                flip board
            </button>
        </div>
    );
};

export default Chessboard;
