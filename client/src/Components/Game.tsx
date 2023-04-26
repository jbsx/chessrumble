import Chessboard from "./Chessboard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Game() {
    let { id } = useParams();
    const [team, setTeam] = useState("");
    let ws: WebSocket | null = null;

    useEffect(() => {
        fetch(`http://localhost:8080/join/${id}`, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(""),
        }).then((res) => {
            if (!res.ok) {
                console.log("unexpected error: ", res);
            } else {
                res.body
                    ?.getReader()
                    .read()
                    .then((body) => {
                        let s = "";
                        body.value?.forEach((i) => {
                            s += String.fromCharCode(i);
                        });
                        console.log(JSON.parse(s));
                        setTeam(JSON.parse(s).team);
                    });
                ws = new WebSocket("ws://localhost:8080/ws");
                console.log(ws);
                ws.addEventListener("message", (event) => {
                    console.log("ws msg -> ", event.data);
                });
            }
        });
    }, []);

    return (
        <div className="Game">
            <Chessboard
                team={team}
                ws={ws}
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            />
            <span style={{ color: "white" }}> Playing as {team} </span>
        </div>
    );
}
