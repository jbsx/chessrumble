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
const PORT = ((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
const JWT_SECRET = (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "LKjfalfjaodifjalsdkLJhOPThHOiGI97T87f7Y";
const server = fastify();
const games = {};
server.register(cors, {
    origin: "http://localhost:8080",
    credentials: true,
});
server.register(ws);
server.register(cookie);
server.get("/create", (req, res) => {
    const token = jwt.sign({
        iat: Date.now(),
    }, JWT_SECRET);
    const id = uuid();
    games[id.toString()] = new Position();
    res.setCookie("token", token.toString(), {
        httpOnly: true,
        sameSite: true,
    }).send({
        id: id.toString(),
    });
});
server.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get("/game/:id", { websocket: true }, (connection, req) => {
            connection.socket.on("open", (message) => {
                if (!games[req.id])
                    console.log("game doesnt exist");
                console.log(games[req.id]);
            });
            connection.socket.on("message", (message) => {
                const msg = message.toString().split(" ");
                switch (msg[0]) {
                    case "play":
                        console.log("playing");
                    default:
                        console.log("defaulting");
                }
            });
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
