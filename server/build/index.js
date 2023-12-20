var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import ws from "@fastify/websocket";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Position } from "kokopu";
import "dotenv/config";
const PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "3000");
const JWT_SECRET = (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : uuid().toString();
const server = fastify();
const games = {};
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
    };
    //setTimeout(
    //    () => {
    //        //clear after 30 minutes
    //        games[game_id].white_conn?.destroy();
    //        games[game_id].black_conn?.destroy();
    //        delete games[game_id];
    //    },
    //    30 * 60 * 1000,
    //);
    res.send({ id: game_id });
});
server.get("/debug/gamestate/:id", (req, res) => {
    const { id } = req.params;
    if (games[id])
        res.send(games[id]);
    else
        res.status(400).send("game does not exist");
});
server.get("/game/join/:id", (req, res) => {
    const { id } = req.params;
    const game = games[id];
    let { token } = req.cookies;
    console.log("JOINING");
    if (!game)
        return res.status(404).send("Game not found");
    validateToken: if (token) {
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        }
        catch (e) {
            res.clearCookie("token");
            token = undefined;
            break validateToken;
        }
        if (payload) {
            if (payload.game_id !== id) {
                token = undefined;
                break validateToken;
            }
            else if (payload.player_id === game.white_id ||
                payload.player_id === game.black_id) {
                return res.send({ message: "OK" });
            }
            else if (game.white_id && game.black_id) {
                console.log(game);
                return res.status(400).send({
                    message: "Game is already in progress",
                });
            }
            else {
                return res.status(400).send({
                    message: "Game is already in progress",
                });
            }
        }
    }
    if (!game.white_id) {
        const player_id = uuid().toString();
        const token = jwt.sign({
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            player: "w",
            game_id: id,
            player_id,
        }, JWT_SECRET);
        games[id].white_id = player_id;
        return res
            .setCookie("token", token.toString(), {
            httpOnly: true,
            secure: true,
            path: "/game",
        })
            .send({ message: "OK" });
    }
    else if (!game.black_id) {
        const player_id = uuid().toString();
        const token = jwt.sign({
            iat: Date.now(),
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            player: "b",
            game_id: id,
            player_id,
        }, JWT_SECRET);
        games[id].black_id = player_id;
        return res
            .setCookie("token", token.toString(), {
            httpOnly: true,
            secure: true,
            path: "/game",
        })
            .send({ message: "OK" });
    }
    else {
        return res.send({ message: "game already in progress" });
    }
});
server.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get("/game/:id", { websocket: true }, (connection, req) => {
            const params = req.params;
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
                const payload = jwt.verify(token, JWT_SECRET);
                //validate game id
                if (payload.game_id !== params.id) {
                    console.log("game invalid or authentication invalid");
                    connection.destroy();
                    return;
                }
                const team = payload.player_id === game.white_id
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
                }
                else if (team === "b") {
                    games[params.id].black_conn = connection;
                }
                console.log(games[params.id]);
                connection.socket.send(`FEN ${game.board.fen()}`);
                connection.socket.send(`TEAM ${team}`);
                connection.socket.on("close", () => {
                    if (team === "w") {
                        games[params.id].white_conn = null;
                    }
                    else if (team === "b") {
                        games[params.id].black_conn = null;
                    }
                });
                connection.socket.on("message", (message) => {
                    var _a, _b;
                    const game = games[params.id];
                    const msg = message.toString().split(" ");
                    switch (msg[0]) {
                        case "play":
                            //check if turn
                            if (team !== game.board.turn()) {
                                console.log("out of turn");
                                break;
                            }
                            const move = game.board.isMoveLegal(msg[1], msg[2]);
                            if (typeof move != "boolean") {
                                if (move.status === "regular") {
                                    game.board.play(move());
                                }
                                else if (move.status === "promotion") {
                                    game.board.play(move("q")); //TODO
                                }
                            }
                            const res = `FEN ${game.board.fen()}`;
                            (_a = game.white_conn) === null || _a === void 0 ? void 0 : _a.socket.send(res);
                            (_b = game.black_conn) === null || _b === void 0 ? void 0 : _b.socket.send(res);
                            break;
                        default:
                            console.log("defaulting");
                    }
                });
            }
            catch (e) {
                console.log(e);
                connection.destroy();
                return;
            }
        });
    });
});
server.listen({ port: PORT }, (err) => {
    if (err) {
        process.exit(1);
    }
    else {
        console.log(`listening on port ${PORT}`);
    }
});
