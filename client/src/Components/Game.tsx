import Chessboard from "./Chessboard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Game() {
    let { id } = useParams();
    const [team, setTeam] = useState("");
    let ws: WebSocket | null = null;

    let init = () => {
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
                        console.log(s);
                        setTeam(JSON.parse(s).team);
                    });
                ws = new WebSocket("ws://localhost:8080/ws");
                console.log(ws);
                ws.addEventListener("message", (event) => {
                    console.log("message on ws conn", event.data);
                });
            }
        });
    };

    useEffect(() => {
        init();
    });

    return (
        <div className="Game">
            <button
                onClick={() => {
                    if (!ws) {
                        console.log("bruhkljasdflkjasdf");
                    }
                    ws?.send("sdfsdf");
                }}
            >
                SEND WS MESSAGE
            </button>
            <Chessboard team={team} />
        </div>
    );
}
