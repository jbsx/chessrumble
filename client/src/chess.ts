import axios from "axios";
import { writable } from "svelte/store";

type Func = () => void;
const onUpdateFunctions: Func[] = [];

export type Type = "k" | "q" | "r" | "b" | "n" | "p";
export type Team = "w" | "b";

export let boardTeam = writable("" as Team);
export let vboard = writable([] as Array<Array<Piece | null>>);

export class Piece {
    team: Team;
    type: Type;

    constructor(team: Team, type: Type) {
        this.team = team;
        this.type = type;
    }
}

export default class Chess {
    player: Team;
    conn: WebSocket | null;
    fen: string;
    board: Array<Array<Piece | null>>;

    constructor(id: string) {
        this.player = "w";

        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        this.conn = null;

        axios
            .get(`http://localhost:3000/game/join/${id}`, {
                withCredentials: true,
            })
            .then(() => {
                this.conn = new WebSocket(`ws://localhost:3000/game/${id}`);

                this.conn.addEventListener("open", () => {
                    console.log("WebSocket connection established");
                });

                this.conn.addEventListener("message", (msg) => {
                    const data = msg.data.split(" ");
                    switch (data[0]) {
                        case "FEN":
                            this.fen = data.slice(1, data.length).join(" ");
                            console.log(this.fen);
                            this.updateBoard();
                            break;
                        case "TEAM":
                            console.log(data[1]);
                            this.player = data[1] as Team;
                            this.updateBoard();
                            break;
                        default:
                            console.log("default");
                    }
                });

                this.conn.addEventListener("close", () => {
                    console.log("connnection closed");
                });
            });

        this.board = Array(8)
            .fill([])
            .map(() => {
                return new Array(8).fill(null);
            });

        this.updateBoard();
    }

    updateBoard() {
        this.board = this.board.map(() => {
            return new Array(8).fill(null);
        });

        //Loop through FEN and populate board
        if (this.player == "w") {
            this.fen
                .split(" ")[0]
                .split("/")
                .forEach((rank, x) => {
                    let offset = 0;
                    rank.split("").forEach((n, y) => {
                        if (parseInt(n)) {
                            offset += parseInt(n) - 1;
                        } else {
                            this.board[x][y + offset] = new Piece(
                                n == n.toUpperCase() ? "w" : "b",
                                n as Type,
                            );
                        }
                    });
                });
        } else {
            this.fen
                .split(" ")[0]
                .split("/")
                .reverse()
                .forEach((rank, x) => {
                    let offset = 0;
                    rank.split("")
                        .reverse()
                        .forEach((n, y) => {
                            if (parseInt(n)) {
                                offset += parseInt(n) - 1;
                            } else {
                                this.board[x][y + offset] = new Piece(
                                    n == n.toUpperCase() ? "w" : "b",
                                    n as Type,
                                );
                            }
                        });
                });
        }
        onUpdateFunctions.forEach((fn) => fn());
    }

    onUpdate(fn: Func) {
        onUpdateFunctions.push(fn);
    }

    play(from: string, to: string) {
        this.conn?.send(`play ${from} ${to}`);
        this.updateBoard();
    }

    private get_rank(x: number): string {
        return this.player === "w"
            ? String.fromCharCode(x + 97)
            : String.fromCharCode(104 - x);
    }

    private get_file(y: number): string {
        return this.player === "w" ? `${8 - y}` : `${y + 1}`;
    }

    get_algebraic(x: number, y: number): string {
        return this.get_rank(x) + this.get_file(y);
    }
}
