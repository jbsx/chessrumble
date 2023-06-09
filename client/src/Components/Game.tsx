import Chessboard from "./Chessboard";
import { Team } from "../ts/Chesspiece";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function Game() {
    let { id } = useParams();
    const [team, setTeam] = useState(Team.W);
    let ws: WebSocket | null = null;

    ws = new WebSocket(`ws://localhost:8080/ws/${id}`);
    ws.addEventListener("message", (event) => {
        let msg = event.data.split(" ");

        msg.forEach((temp: String) => {
            let data = temp.split(":");
            if (data[0] == "Team") {
                setTeam(data[1] == "W" ? Team.W : Team.B);
            }
        });
    });
    ws.addEventListener("open", (event) => {
        console.log("open event", event);
    });

    return (
        <div className="Game">
            <Chessboard team={team} ws={ws} />
        </div>
    );
}
