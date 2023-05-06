export default function Home() {
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

    return (
        <div className="Home">
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

                        console.log(JSON.parse(s));
                        window.location.assign(
                            `/game/${JSON.parse(s).game_id}`,
                        );
                    } else {
                        console.log(res);
                        throw Error;
                    }
                }}
            >
                CREATE GAME
            </button>
        </div>
    );
}
