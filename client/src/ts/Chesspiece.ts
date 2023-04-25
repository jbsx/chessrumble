export enum Type {
    P,
    N,
    B,
    R,
    Q,
    K,
}

export enum Team {
    W,
    B,
}

export default class Piece {
    private type: Type;
    private team: Team;

    constructor(type: Type, team: Team) {
        this.type = type;
        this.team = team;
    }

    getValue(): number {
        switch (this.type) {
            case Type.P:
                return 1;
            case Type.N:
                return 3;
            case Type.B:
                return 3;
            case Type.R:
                return 5;
            case Type.Q:
                return 9;
            case Type.K:
                return Infinity;
            default:
                return 0;
        }
    }

    getTeam(): Team {
        return this.team;
    }

    getType(): Type {
        return this.type;
    }

    getFEN(): string {
        let res = "";
        switch (this.type) {
            case Type.P:
                res = "p";
                break;
            case Type.N:
                res = "n";
                break;
            case Type.B:
                res = "b";
                break;
            case Type.R:
                res = "r";
                break;
            case Type.Q:
                res = "q";
                break;
            case Type.K:
                res = "k";
                break;
            default:
                break;
        }

        if (this.team === Team.W) {
            return res.toUpperCase();
        }

        return res;
    }

    static fromFEN(fen: string): Piece {
        let pieceTeam: Team;
        let pieceType: Type;

        if (fen.charCodeAt(0) >= 97) {
            pieceTeam = Team.B;
        } else {
            pieceTeam = Team.W;
        }

        switch (fen.toLowerCase()) {
            case "p":
                pieceType = Type.P;
                break;
            case "n":
                pieceType = Type.N;
                break;
            case "b":
                pieceType = Type.B;
                break;
            case "r":
                pieceType = Type.R;
                break;
            case "q":
                pieceType = Type.Q;
                break;
            case "k":
                pieceType = Type.K;
                break;
            default:
                throw Error("invalid FEN");
        }

        return new Piece(pieceType, pieceTeam);
    }
}
