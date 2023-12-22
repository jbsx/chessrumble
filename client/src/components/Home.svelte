<script lang="ts">
    import axios from "axios";
    let game_id = "";
</script>

<main lang="ts">
    <div class="h-screen flex flex-col justify-center items-center">
        <div class="flex flex-col gap-8 items-center">
            <h1 class="text-6xl text-[var(--main)] uppercase">
                Ching<span class="text-[var(--black)]">Ming</span>
            </h1>
            <div
                class="m-auto p-10 w-fit flex flex-col justify-around items-center bg-zinc-600 rounded-2xl font-xl gap-10 border-2 border-[var(--white)]"
            >
                <div class="flex">
                    <button
                        class="bg-zinc-300 py-3 px-7 rounded-md font-bold uppercase text-zinc-800 hover:bg-[var(--black)] border-[var(--main)]"
                        on:click={async () => {
                            const res = await axios.get(
                                "http://localhost:3000/game/create",
                                { withCredentials: true },
                            );
                            const { id } = res.data;
                            window.location.href = `/game/${id}`;
                        }}>Create</button
                    >
                </div>
                <div class="bg-zinc-300 h-[1px] w-full" />
                <div
                    class="w-full flex flex-col justify-center items-center gap-2"
                >
                    <input
                        class="w-full min-w-[400px] p-3 rounded-md focus:outline-none"
                        type="text"
                        bind:value={game_id}
                    />
                    <button
                        class="bg-zinc-300 py-3 px-7 rounded-md font-bold uppercase text-zinc-800 hover:bg-[var(--black)] border-[var(--main)]"
                        on:click={async () => {
                            const res = await axios.get(
                                `http://localhost:3000/game/join/${game_id}`,
                                { withCredentials: true },
                            );

                            if (res.status === 200) {
                                window.location.href = `/game/${game_id}`;
                            } else {
                                window.alert(res.status);
                            }
                        }}>Connect</button
                    >
                </div>
            </div>
        </div>
    </div>
</main>
