<script lang="ts">
    import { Piece, Team } from "../chess";
    import { get_algebraic } from "../utils";
    import Chess, { boardTeam, board } from "../chess";
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";

    export let id;

    let hover = false;
    let hover_offset = [0, 0];
    let hover_pos = [0, 0];
    let from = [0, 0];

    let game = new Chess(id);

    const bruh = id as string;

    $: bTeam = "w" as Team;
    $: vboard = Array(8)
        .fill([])
        .map(() => {
            return new Array(8).fill(null);
        }) as Array<Array<Piece | null>>;

    onMount(() => {
        boardTeam.subscribe((t) => {
            bTeam = t;
        });
        board.subscribe((b) => {
            vboard = b;
        });
        return;
    });
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
        on:mouseleave={(e) => {
            e.preventDefault();
            hover = false;
        }}
    >
        <div class="flex flex-col h-screen gap-8 items-center overflow-hidden">
            <a class="hover:no-underline" href="/"
                ><h1 class="text-6xl text-[var(--main)] uppercase">
                    <span>Ching</span><span class="text-[var(--black)]"
                        >Ming</span
                    >
                </h1></a
            >
            <button
                class="p-4 flex justify-center items-center gap-4 text-white uppercase
                    bg-[rgba(0,0,0,0.1)] rounded-xl cursor-pointer hover:bg-[rgba(0,0,0,0.2)] border-none"
                on:click={() => {
                    navigator.clipboard.writeText(bruh);
                    //TODO: notify "copied to clipboard"
                }}
            >
                {bruh}
                <Icon icon="octicon:copy-16" width={20} />
            </button>
            <div class="flex flex-col justify-center items-center">
                <div class="w-fit" on:contextmenu|preventDefault>
                    {#each vboard as rank, y}
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
                                                e.clientX - e.layerX + 60,
                                                //@ts-ignore
                                                e.clientY - e.layerY + 60,
                                            ];
                                            hover_pos = [
                                                e.clientX - hover_offset[0],
                                                e.clientY - hover_offset[1],
                                            ];

                                            from = [x, y];
                                        } else if (e.button == 2) {
                                            hover = false;
                                        }
                                    }}
                                    on:mouseup={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (e.button == 2) return;

                                        if (hover) {
                                            game.play(
                                                get_algebraic(
                                                    from[0],
                                                    from[1],
                                                    bTeam,
                                                ),
                                                get_algebraic(x, y, bTeam),
                                            );
                                        }

                                        hover = false;
                                    }}
                                >
                                    <span
                                        class="absolute top-0 right-1 opacity-50"
                                        >{get_algebraic(x, y, bTeam)}</span
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
