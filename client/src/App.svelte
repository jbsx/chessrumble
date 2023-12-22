<script lang="ts">
    import router from "page";
    import "./style.css";
    import Home from "./components/Home.svelte";
    import NotFound from "./components/NotFound.svelte";
    import Game from "./components/Game.svelte";
    import { ComponentType } from "svelte";

    let page: ComponentType;
    let props: { [key: string]: string };

    router("/", () => {
        page = Home;
    });

    router("/game/:id", (ctx) => {
        props = { id: ctx.params.id };
        page = Game;
    });

    router("/*", () => {
        page = NotFound;
    });

    router.start();
</script>

<main>
    <svelte:component this={page} {...props} />
</main>

<style>
</style>
