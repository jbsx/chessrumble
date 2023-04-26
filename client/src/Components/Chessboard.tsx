import { useEffect, useState } from "react";
import Piece, { Team } from "../ts/Chesspiece";
import "../CSS/Chessboard.css";

type chessboardProps = {
    fen?: string;
    team?: string;
    ws?: WebSocket | null;
};

const Chessboard = (props: chessboardProps) => {
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

    //render using FEN if passed as props
    //render starting position if FEN undefined
    const [board, setBoard] = useState(
        props.fen
            ? fromFEN(props.fen)
            : fromFEN(
                  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              ),
    );
    const [turn, setTurn] = useState(Team.W);
    const [team, setTeam] = useState(Team.W);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    //Converts array coordinates to chess coordinates
    const arrToChessCoord = (c: string): string => {
        let res = "";
        if (team == Team.W) {
            res += String.fromCharCode(97 + parseInt(c.charAt(0)));
            res += (parseInt(c.charAt(1)) - 8) * -1;
        } else {
            res += String.fromCharCode(104 - parseInt(c.charAt(0)));
            res += parseInt(c.charAt(1)) + 1;
        }
        return res;
    };

    //Converts chess coordinates to array coordinates
    const chessToArrCoord = (c: string): string => {
        let res = "";
        if (team == Team.W) {
            res += String.fromCharCode(97 + parseInt(c.charAt(0)));
            res += (parseInt(c.charAt(1)) - 8) * -1;
        } else {
            res += String.fromCharCode(104 - parseInt(c.charAt(0)));
            res += parseInt(c.charAt(1)) + 1;
        }
        return res;
    };

    //sends move data through the websocket connection
    const sendMove = (from: string, to: string) => {
        console.log(from + " -> " + to);
    };

    useEffect(() => {
        if (from && to) {
            sendMove(chessToArrCoord(from), chessToArrCoord(to));
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
        setTeam(team === Team.W ? Team.B : Team.W);
    };

    return (
        <div>
            <div className="options">
                <button
                    onClick={() => {
                        flipBoard();
                    }}
                >
                    Flip Board
                </button>
            </div>
            <div className="chessboard turn-black">
                {board.map((row: Array<Piece>, x: number) => {
                    return (
                        <div className="row" key={x}>
                            {row.map((s: Piece, y: number) => {
                                return (
                                    <div
                                        className={`square ${
                                            s ? s.getFEN() : ""
                                        } ${
                                            (x + y) % 2 ===
                                            (team === Team.B ? 1 : 0)
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
            </div>
        </div>
    );
};

export default Chessboard;
