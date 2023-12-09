<script lang="ts">
    //import axios from "axios";
    import Chess, { Team } from "../chess";

    //axios.get("http://localhost:3000/game", {withCredentials: true}).then(res => console.log(res.data));

    let ws = new WebSocket("ws://localhost:3000/game/bruh");

    //ws.onopen(function(e){
    //    ws.send("bruh")
    //})

    let game = new Chess("w");
    let hover = false;
    let hover_offset = [0, 0];
    let hover_pos = [0, 0];

    let board = game.board;

    let from = [0, 0];
</script>

<main>
    <div
        on:mousemove={(e) => {
            e.preventDefault();
            if (hover)
                hover_pos = [
                    e.clientX - hover_offset[0],
                    e.clientY - hover_offset[1],
                ];
        }}
        on:mouseup={(e) => {
            e.preventDefault();
            hover = false;
        }}
        on:mouseleave={(e)=>{
            e.preventDefault()
            hover= false;
        }}
    >
        <div class="flex flex-col h-screen gap-8 items-center overflow-hidden">
            <a href="/"
                ><h1 class="text-6xl text-[var(--main)] uppercase">
                    Ching<span class="text-[var(--black)]">Ming</span>
                </h1></a
            >
            <div class="flex flex-col justify-center items-center">
                <div class="flex gap-2 m-2 hidden">
                    <button
                        class="bg-zinc-300 py-3 px-7 rounded-md font-bold uppercase text-zinc-800 hover:bg-[var(--black)] border-[var(--main)]"
                        on:click={() => {
                            game.updateBoard();
                            board = game.board;
                        }}
                    >
                        rerender
                    </button>

                    <button
                        class="bg-zinc-300 py-3 px-7 rounded-md font-bold uppercase text-zinc-800 hover:bg-[var(--black)] border-[var(--main)]"
                        on:click={() => {
                            game.toggleTeam();
                            game.updateBoard();
                            board = game.board;
                        }}
                    >
                        Toggle Team
                    </button>
                </div>
                <div
                    class="w-fit"
                    on:contextmenu|preventDefault
                >
                    {#each board as rank, y}
                        <div class="flex">
                            {#each rank as sq, x}
                                <div
                                    class={`relative w-[120px] h-[120px] flex justify-center items-center select-none ouline-none ${
                                        (x + y) % 2 == 0
                                            ? "bg-[var(--white)]"
                                            : "bg-[var(--black)]"
                                    }`}
                                    on:mousedown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (e.button == 0) {
                                            hover = true;
                                            hover_offset = [
                                                //@ts-ignore
                                                e.clientX - (e.layerX) + 60,
                                                //@ts-ignore
                                                e.clientY - (e.layerY) + 60,
                                            ];
                                            hover_pos = [e.clientX - hover_offset[0], e.clientY - hover_offset[1]];

                                            from = [x, y];
                                        } else if (e.button == 2) {
                                            hover = false;
                                        }
                                    }}
                                    on:mouseup={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (e.button == 2) return;

                                        if (hover){
                                            const ok = game.play(
                                                game.get_algebraic(
                                                    from[0],
                                                    from[1],
                                                ),
                                                game.get_algebraic(x, y),
                                            );
                                            if (ok) {
                                                board = game.board;
                                            }

                                        }

                                        hover = false

                                    }}
                                >
                                    <span
                                        class="absolute top-0 right-1 opacity-30"
                                        >{game.get_algebraic(x, y)}</span
                                    >
                                    {#if sq}
                                        <img
                                            src={`/${sq.type}.svg`}
                                            alt={sq.type}
                                            class={`w-full h-full select-none z-[1] ${
                                                hover &&
                                                x == from[0] &&
                                                y == from[1]
                                                    ? "absolute pointer-events-none z-[2]"
                                                    : ""
                                            }`}
                                            style:left={`${hover_pos[0]}px`}
                                            style:top={`${hover_pos[1]}px`}
                                        />
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</main>
