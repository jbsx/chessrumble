import axios from "axios";
import {writable} from "svelte/store";

export type Type = "k"|"q"|"r"|"b"|"n"|"p";
export type Team = "w"|"b";

export let boardTeam = writable("w" as Team);

export let board = writable(
    Array(8).fill([]).map(() => { return new Array(8).fill(null);}) as
        Array<Array<Piece|null>>,
);

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
    _conn: WebSocket|null;
    fen: string;

    constructor(id: string) {
        this.player = "w";

        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        this._conn = null;

        axios
            .get(`http://localhost:3000/game/join/${id}`, {
                withCredentials : true,
            })
            .then(() => {
                this._conn = new WebSocket(`ws://localhost:3000/game/${id}`);

                this._conn.addEventListener(
                    "open",
                    () => { console.log("WebSocket connection established"); });

                this._conn.addEventListener("message", (msg) => {
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
                        boardTeam.set(this.player);
                        this.updateBoard();
                        break;
                    default:
                        console.log("default");
                    }
                });

                this._conn.addEventListener(
                    "close", () => { console.log("connnection closed"); });
            });

        this.updateBoard();
    }

    updateBoard() {
        board.update(() => {
            const temp =
                Array(8).fill([]).map(() => { return Array(8).fill(null); }) as
                Array<Array<Piece|null>>;

            // Loop through FEN and populate board
            if (this.player == "w") {
                this.fen.split(" ")[0].split("/").forEach((rank, x) => {
                    let offset = 0;
                    rank.split("").forEach((n, y) => {
                        if (parseInt(n)) {
                            offset += parseInt(n) - 1;
                        } else {
                            temp[x][y + offset] = new Piece(
                                n == n.toUpperCase() ? "w" : "b",
                                n as Type,
                            );
                        }
                    });
                });
            } else {
                this.fen.split(" ")[0].split("/").reverse().forEach(
                    (rank, x) => {
                        let offset = 0;
                        rank.split("").reverse().forEach((n, y) => {
                            if (parseInt(n)) {
                                offset += parseInt(n) - 1;
                            } else {
                                temp[x][y + offset] = new Piece(
                                    n == n.toUpperCase() ? "w" : "b",
                                    n as Type,
                                );
                            }
                        });
                    });
            }

            return temp;
        });
    }

    play(from: string, to: string) {
        this._conn?.send(`play ${from} ${to}`);
        this.updateBoard();
    }
}
