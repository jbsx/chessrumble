import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import ws from "@fastify/websocket";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Position } from "kokopu";

const PORT = (process.env.PORT ?? 3000) as number;
const JWT_SECRET =
    process.env.JWT_SECRET ?? "LKjfalfjaodifjalsdkLJhOPThHOiGI97T87f7Y";
const server = fastify();

const games: { [k: string]: Position } = {};

server.register(cors, {
    origin: "http://localhost:8080",
    credentials: true,
});
server.register(ws);
server.register(cookie);

server.get("/create", (req, res) => {
    const token = jwt.sign(
        {
            iat: Date.now(),
        },
        JWT_SECRET,
    );

    const id = uuid();

    games[id.toString()] = new Position();

    res.setCookie("token", token.toString(), {
        httpOnly: true,
        sameSite: true,
    }).send({
        id: id.toString(),
    });
});

server.register(async function (fastify) {
    fastify.get("/game/:id", { websocket: true }, (connection, req) => {
        connection.socket.on("open", (message: any) => {
            if (!games[req.id]) console.log("game doesnt exist");
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

server.listen({ port: PORT }, (err) => {
    if (err) {
        process.exit(1);
    } else {
        console.log(`listening on port ${PORT}`);
    }
});
