import { Position, Square } from "kokopu";

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
    game: Position;
    board: Array<Array<Piece | null>>;

    constructor(player: Team) {
        this.player = player;
        this.game = new Position();
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
            this.game
                .fen()
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
            this.game
                .fen()
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

    play(from: string, to: string): boolean {
        const move = this.game.isMoveLegal(from as Square,to as Square)
        if(move){
            const res = this.game.play(move("q"))
            if (res) this.updateBoard();
            return res
        } else {
            return false
        }

        ////is turn
        //if (this.player != this.game.turn()) return false;

        //// Convert move to algebraic notation
        //let move = "";
        //const piece = this.get_piece(from);
        //const fen = this.game.fen().split(" ");

        //// moving empty piece
        //if (!piece) return false;

        //// is pawn or a different piece
        //if (piece.type.toLowerCase() != "p") {
        //    move += piece.type.toUpperCase();
        //}

        //// is capture
        //if (this.get_piece(to)) {
        //    if (piece.type.toLowerCase() === "p") move += from.charAt(0);
        //    move += "x";
        //}

        //// is en passant
        //if (fen[3] === to && piece.type === "p") {
        //    move += from.charAt(0) + "x";
        //}

        //// is castle
        //if (piece.type === "k") {
        //    if (piece.team === "w") {
        //        if (to === "g1" && fen[2].search("K") != -1) {
        //            let ok = this.game.play("O-O");
        //            if (ok) this.updateBoard();
        //            return ok;
        //        } else if (to === "c1" && fen[2].search("Q") !== -1) {
        //            let ok = this.game.play("O-O-O");
        //            if (ok) this.updateBoard();
        //            return ok;
        //        }
        //    } else {
        //        if (to === "g8" && fen[2].search("k") !== -1) {
        //            let ok = this.game.play("O-O");
        //            if (ok) this.updateBoard();
        //            return ok;
        //        } else if (to === "c8" && fen[2].search("q") !== -1) {
        //            let ok = this.game.play("O-O-O");
        //            if (ok) this.updateBoard();
        //            return ok;
        //        }
        //    }
        //}
        //
        //// is promotion
        //if (piece.type === "p" && to.charAt(1) === "8" || to.charAt(1) === "1"){

        //}

        //// is checkmate or dead (has game ended)
        //// is pinned to the king

        //// edge case - pawn being moved is not the same is intended
        //if (
        //    move === "" &&
        //    piece.type === "p" &&
        //    from.charAt(0) !== to.charAt(0)
        //)
        //    return false;

        //move += to;
        //let ok = this.game.play(move);
        //if (ok) this.updateBoard();
        //return ok;
    }

    get_piece(from: string): Piece | null {
        const piece = this.game.square(from as Square);
        if (piece == "-") {
            return null;
        } else {
            return new Piece(piece.charAt(0) as Team, piece.charAt(1) as Type);
        }
    }

    turn(): Team {
        return this.game.turn() as Team;
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
