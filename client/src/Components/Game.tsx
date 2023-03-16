import Chessboard from "./Chessboard";
import { useState } from "react";

const Game = () => {
    const [inpval, setInp] = useState("");

    const fetchConfig = (method: string): RequestInit => {
        return {
            method, // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "include", // include, *same-origin, omit
            headers: { "Content-Type": "application/json" },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(""), // body data type must match "Content-Type" header
        } as RequestInit;
    };

    const parseFetch = async (url: string): Promise<string> => {
        let res = await fetch(url, fetchConfig("POST"));
        let body = await res.body?.getReader().read();

        let s = "";
        body?.value?.forEach((i) => {
            s += String.fromCharCode(i);
        });

        return s;
    };

    return (
        <div>
            <Chessboard />
            <div className="navbuttons">
                <button
                    onClick={async () => {
                        const res = await fetch(
                            "http://localhost:8080/create",
                            fetchConfig("POST"),
                        );
                        if (res.ok) {
                            const body = await res.body?.getReader().read();

                            let s = "";
                            body?.value?.forEach((i) => {
                                s += String.fromCharCode(i);
                            });

                            window.location.assign(
                                `/join/${JSON.parse(s).message}`,
                            );
                        } else {
                            console.log(res);
                            throw Error;
                        }
                    }}
                >
                    CREATE GAME
                </button>
                <br />
                <input
                    type="text"
                    value={inpval}
                    onChange={(e) => {
                        setInp(e.target.value);
                    }}
                />
                <button
                    onClick={async () => {
                        console.log(
                            JSON.parse(
                                await parseFetch(
                                    `http://localhost:8080/join/${inpval}`,
                                ),
                            ),
                        );
                    }}
                >
                    JOIN GAME
                </button>
            </div>
        </div>
    );
};

export default Game;
