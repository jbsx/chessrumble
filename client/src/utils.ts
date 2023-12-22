import { Team } from "./chess";

export function get_algebraic(x: number, y: number, team: Team): string {
    return `${
        team === "w"
            ? String.fromCharCode(x + 97)
            : String.fromCharCode(104 - x)
    }${team === "w" ? `${8 - y}` : `${y + 1}`}`;
}
