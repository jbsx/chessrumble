import { useEffect, useState, useMemo } from "react";
import Piece, { Team } from "../ts/Chesspiece";
import "../CSS/Chessboard.css";

type chessboardProps = {
    fen?: string;
    team: Team;
    ws: WebSocket | null;
};

const Chessboard = (props: chessboardProps) => {
    const [turn, setTurn] = useState(Team.W);

    //Forsyth-Edwards Notation
    //For more context: https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
    const fromFEN = (fen: string): Array<Array<Piece>> => {
        const args = fen.split(" ");
        let rows = args[0].split("/");

        let res = new Array(8);

        if (props.team == Team.W) {
            for (let i = 0; i < 8; i++) {
                res[i] = new Array(8).fill(undefined);
                let pos = 0;
                rows[i].split("").forEach((u, idx) => {
                    if (!isNaN(parseInt(u))) {
                        pos += parseInt(u) - 1;
                    } else {
                        res[i][pos + idx] = Piece.fromFEN(u);
                    }
                });
            }
        } else {
            rows.reverse();
            for (let i = 0; i < 8; i++) {
                res[i] = new Array(8).fill(undefined);
                let pos = 0;
                rows[i]
                    .split("")
                    .reverse()
                    .forEach((u, idx) => {
                        if (!isNaN(parseInt(u))) {
                            pos += parseInt(u) - 1;
                        } else {
                            res[i][pos + idx] = Piece.fromFEN(u);
                        }
                    });
            }
        }

        return res;
    };

    //render using FEN if passed as props
    //render starting position if FEN undefined
    const board = useMemo(() => {
        //if (props.fen) {
        //    return fromFEN(props.fen);
        //} else {
        return fromFEN(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );
        //}
    }, [turn, props.team]);

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    //Converts array coordinates to chess coordinates
    const arrToChessCoord = (c: string): string => {
        let res = "";
        if (props.team == Team.W) {
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
        if (props.team == Team.W) {
            res += c.charCodeAt(0) - 97;
            res += (parseInt(c.charAt(1)) - 8) * -1;
        } else {
            res += c.charCodeAt(0) - 97;
            res += (parseInt(c.charAt(1)) - 8) * -1;
        }
        return res;
    };

    //sends move data through the websocket connection
    const sendMove = (from: string, to: string) => {
        console.log(from, to);
        console.log(chessToArrCoord(from) + " -> " + chessToArrCoord(to));
    };

    useEffect(() => {
        if (from && to) {
            sendMove(arrToChessCoord(from), arrToChessCoord(to));
            setFrom("");
            setTo("");
        }
    }, [from, to]);

    return (
        <div>
            <div
                className={`chessboard turn-${
                    turn === Team.W ? "white" : "black"
                }`}
            >
                {board.map((row: Array<Piece>, x: number) => {
                    return (
                        <div className="row" key={x}>
                            {row.map((s: Piece, y: number) => {
                                return (
                                    <div
                                        className={`square ${
                                            s ? s.getFEN() : ""
                                        } ${
                                            (x + y) % 2 === 0
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
