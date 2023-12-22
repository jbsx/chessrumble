export type Type = "k" | "q" | "r" | "b" | "n" | "p";
export type Team = "w" | "b";

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
    conn: WebSocket;
    fen: string;
    board: Array<Array<Piece | null>>;

    constructor(player: Team) {
        this.player = player;

        this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        this.conn = new WebSocket("ws://localhost:3000/game/bruh/");

        this.conn.addEventListener("open", (message)=>{
            console.log(message)
        })

        this.conn.addEventListener("message", (message)=>{
            console.log(message)
        })

        this.board = Array(8)
            .fill([])
            .map(() => {
                return new Array(8).fill(null);
            });

        this.updateBoard();
    }

    updateBoard() {
        //Clear board
        this.board = this.board.map(() => {
            return new Array(8).fill(null);
        });

        if (this.player == "w") {
            //WHITE
            //Loop through FEN and populate board
            
            //get fen from WebSocket
            this.conn.send("fen")
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
            //BLACK
            //Loop through FEN and populate board
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
    }

    toggleTeam() {
        this.player = this.player === "w" ? "b" : "w";
    }

    play(from: string, to: string) {
        this.conn.send(`play ${from} ${to}`)
    }

    get_piece(from: string): Piece | null {

        return null

        //const piece = this.conn.square(from as Square);
        //if (piece == "-") {
        //    return null;
        //} else {
        //    return new Piece(piece.charAt(0) as Team, piece.charAt(1) as Type);
        //}
    }

    turn(): Team {
        return "w";
        //return this.conn.turn() as Team;
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
