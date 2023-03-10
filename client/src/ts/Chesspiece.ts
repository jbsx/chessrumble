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

class Piece {
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
}

export default Piece;
