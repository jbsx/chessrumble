var _a, _b;
import fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import ws from "@fastify/websocket";
import jwt from "jsonwebtoken";
const PORT = ((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
const JWT_SECRET = (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "LKjfalfjaodifjalsdkLJhOPThHOiGI97T87f7Y";
const server = fastify();
server.register(cors);
server.register(ws);
server.register(cookie);
server.get("/game", (req, res) => {
    const token = jwt.sign({
        iat: Date.now(),
    }, JWT_SECRET);
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
server.listen({
    port: PORT,
}, () => {
    console.log(`listening on port ${PORT}`);
});
