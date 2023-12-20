import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import ws from "@fastify/websocket";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Position, Square } from "kokopu";
import { GameState, Payload } from "./types";
import "dotenv/config";

const PORT = parseInt(process.env.PORT ?? "3000");
const JWT_SECRET = process.env.JWT_SECRET ?? uuid().toString();
const server = fastify();

const games: { [k: string]: GameState } = {};

server.register(cors, {
    origin: "http://localhost:8080",
    credentials: true,
});
server.register(ws);
server.register(cookie);

server.get("/game/create", (_, res) => {
    const game_id = uuid().toString();

    games[game_id.toString()] = {
        white_id: null,
        black_id: null,
        white_conn: null,
        black_conn: null,
        board: new Position(),
    } as GameState;

    setTimeout(
        () => {
            //clear after 30 minutes
            games[game_id].white_conn?.destroy();
            games[game_id].black_conn?.destroy();
            delete games[game_id];
        },
        30 * 60 * 1000,
    );

    res.send({ id: game_id });
});

server.get("/debug/gamestate/:id", (req, res) => {
    const { id } = req.params as { id: string };
    if (games[id]) res.send(games[id]);
    else res.status(400).send("game does not exist");
});

server.get("/game/join/:id", (req, res) => {
    const { id } = req.params as { id: string };
    const game = games[id];
    let { token } = req.cookies;

    if (!game) return res.status(404).send("Game not found");

    validateToken: if (token) {
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET) as Payload;
        } catch (e) {
            res.clearCookie("token");
            token = undefined;
            break validateToken;
        }

        if (payload) {
            if (payload.game_id !== id) {
                token = undefined;
                break validateToken;
            } else if (
                payload.player_id === game.white_id ||
                payload.player_id === game.black_id
            ) {
                return res.send({ message: "OK" });
            } else if (game.white_id && game.black_id) {
                console.log(game);
                return res.status(400).send({
                    message: "Game is already in progress",
                });
            } else {
                return res.status(400).send({
                    message: "Game is already in progress",
                });
            }
        }
    }

    if (!game.white_id) {
        const player_id = uuid().toString();
        const token = jwt.sign(
            {
                iat: Date.now(),
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                player: "w",
                game_id: id,
                player_id,
            } satisfies Payload,
            JWT_SECRET,
        );

        games[id].white_id = player_id;

        return res
            .setCookie("token", token.toString(), {
                httpOnly: true,
                secure: true,
                path: "/game",
            })
            .send({ message: "OK" });
    } else if (!game.black_id) {
        const player_id = uuid().toString();
        const token = jwt.sign(
            {
                iat: Date.now(),
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                player: "b",
                game_id: id,
                player_id,
            } satisfies Payload,
            JWT_SECRET,
        );

        games[id].black_id = player_id;

        return res
            .setCookie("token", token.toString(), {
                httpOnly: true,
                secure: true,
                path: "/game",
            })
            .send({ message: "OK" });
    } else {
        return res.send({ message: "game already in progress" });
    }
});

server.register(async function (fastify) {
    fastify.get("/game/:id", { websocket: true }, (connection, req) => {
        const params = req.params as { id: string };
        const { token } = req.cookies;
        const game = games[params.id];

        if (!game) {
            console.log("game doesnt exist");
            connection.destroy();
            return;
        }

        if (!token) {
            console.log("no token");
            connection.destroy();
            return;
        }

        //verify JWT
        try {
            const payload = jwt.verify(token, JWT_SECRET) as Payload;

            //validate game id
            if (payload.game_id !== params.id) {
                console.log("game invalid or authentication invalid");
                connection.destroy();
                return;
            }

            const team =
                payload.player_id === game.white_id
                    ? "w"
                    : payload.player_id === game.black_id
                    ? "b"
                    : null;

            if (!team) {
                connection.destroy();
                return;
            }

            if (team === "w") {
                games[params.id].white_conn = connection;
            } else if (team === "b") {
                games[params.id].black_conn = connection;
            }

            console.log(games[params.id]);

            connection.socket.send(`FEN ${game.board.fen()}`);
            connection.socket.send(`TEAM ${team}`);

            connection.socket.on("close", () => {
                if (team === "w") {
                    games[params.id].white_conn = null;
                } else if (team === "b") {
                    games[params.id].black_conn = null;
                }
            });

            connection.socket.on("message", (message) => {
                const game = games[params.id];
                const msg = message.toString().split(" ");
                switch (msg[0]) {
                    case "play":
                        //check if turn
                        if (team !== game.board.turn()) {
                            console.log("out of turn");
                            break;
                        }

                        const move = game.board.isMoveLegal(
                            msg[1] as Square,
                            msg[2] as Square,
                        );

                        if (typeof move != "boolean") {
                            if (move.status === "regular") {
                                game.board.play(move());
                            } else if (move.status === "promotion") {
                                game.board.play(move("q")); //TODO
                            }
                        }

                        const res = `FEN ${game.board.fen()}`;
                        game.white_conn?.socket.send(res);
                        game.black_conn?.socket.send(res);
                        break;
                    default:
                        console.log("defaulting");
                }
            });
        } catch (e) {
            console.log(e);
            connection.destroy();
            return;
        }
    });
});

server.listen({ port: PORT }, (err) => {
    if (err) {
        process.exit(1);
    } else {
        console.log(`listening on port ${PORT}`);
    }
});
