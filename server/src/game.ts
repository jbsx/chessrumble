import { v4 as uuid } from "uuid";
import WebSocket from "ws";

export class Game {
    id: string;
    white: WebSocket | null;
    black: WebSocket | null;

    constructor() {
        this.id = uuid();
        this.white = null;
        this.black = null;
    }
}
