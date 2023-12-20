import { SocketStream } from "@fastify/websocket";
import { Position } from "kokopu";

export interface Payload {
    iat: number;
    exp: number;
    player: "w" | "b";
    game_id: string;
    player_id: string;
}

export interface GameState {
    white_id: string | null;
    black_id: string | null;
    white_conn: SocketStream | null;
    black_conn: SocketStream | null;
    board: Position;
}
