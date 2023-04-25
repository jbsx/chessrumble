import { useEffect, useState } from "react";
import Piece from "../ts/Chesspiece";
import "../CSS/Chessboard.css";

type chessboardProps = {
    fen?: string;
    team?: string;
    ws?: WebSocket | null;
};

const Chessboard = (props: chessboardProps) => {
    const [board, setBoard] = useState(new Array());
    const [team, setTeam] = useState("white");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    //Forsyth-Edwards Notation
    //For more context: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
    const fromFEN = (fen: string): Array<Array<Piece>> => {
        const args = fen.split(" ");
        const rows = args[0].split("/");

        let res = new Array(8);

        for (let i = 0; i < 8; i++) {
            res[i] = new Array(8).fill(undefined);

            let idx = 0;
            while (idx < 8) {
                const curr = rows[i].charAt(idx);
                if (curr >= "0" && curr <= "9") {
                    idx += parseInt(curr);
                } else {
                    res[i][idx] = Piece.fromFEN(curr);
                }
                idx += 1;
            }
        }

        return res;
    };

    if (props.fen) {
        //start from specific given position
        setBoard(fromFEN(props.fen));
    } else {
        //initial position
        setBoard(
            fromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
        );
    }

    //Converts array coordinates to chess coordinates
    const arrToChessCoord = (c: string): string => {
        let res = "";
        if (team == "white") {
            res += String.fromCharCode(97 + parseInt(c.charAt(0)));
            res += (parseInt(c.charAt(1)) - 8) * -1;
        } else {
            res += String.fromCharCode(104 - parseInt(c.charAt(0)));
            res += parseInt(c.charAt(1)) + 1;
        }
        return res;
    };

    //sends moved data through websocket connection
    const sendMove = (from: string, to: string) => {
        console.log(from + " -> " + to);
    };

    useEffect(() => {
        if (from && to) {
            sendMove(arrToChessCoord(from), arrToChessCoord(to));
            setFrom("");
            setTo("");
        }
    }, [from, to]);

    useEffect(() => {
        if (props.team === "black") flipBoard();
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
        setTeam(team === "white" ? "black" : "white");
    };

    return (
        <div className="chessboard">
            {board.map((row: Array<Piece>, x: number) => {
                return (
                    <div className="row" key={x}>
                        {row.map((s: Piece, y: number) => {
                            return (
                                <div
                                    className={`square ${s ? s.getFEN() : ""} ${
                                        (x + y) % 2 ===
                                        (team === "black" ? 1 : 0)
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
                                ></div>
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
                Flip Board
            </button>
        </div>
    );
};

export default Chessboard;
