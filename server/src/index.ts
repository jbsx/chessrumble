import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import ws from "@fastify/websocket";
import jwt from "jsonwebtoken";

const PORT = (process.env.PORT ?? 3000) as number;
const JWT_SECRET =
    process.env.JWT_SECRET ?? "LKjfalfjaodifjalsdkLJhOPThHOiGI97T87f7Y";
const server = fastify();

server.register(cors);
server.register(ws);
server.register(cookie);

server.get("/game", (req, res) => {
    const token = jwt.sign(
        {
            iat: Date.now(),
        },
        JWT_SECRET,
    );

    res.setCookie("token", token.toString(), {
        httpOnly: true,
        sameSite: true,
    }).send({
        message: "OK",
    });
});

server.get("/game/:id", (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        //TODO
        return;
    }

    const data = jwt.verify(token, JWT_SECRET);
    console.log(data);

    res.send({ message: "OK" });
});

server.get("/game/bruh/", { websocket: true }, (con, req) => {
    con.socket.on("message", (message) => {
        console.log(message);
        con.socket.send("hi from server");
    });
});

server.listen(
    {
        port: PORT,
    },
    () => {
        console.log(`listening on port ${PORT}`);
    },
);
