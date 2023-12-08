<script lang="ts">
    import router from "page";
    import "./style.css";
    import Home from "./components/Home.svelte";
    import NotFound from "./components/NotFound.svelte";
    import Game from "./components/Game.svelte";
    import { ComponentType } from "svelte";

    let page: ComponentType;

    router("/", () => {
        page = Home;
    });

    router("/:id", (ctx) => {
        page = Game;
    });

    router("/*", () => {
        page = NotFound;
    });

    router.start();
</script>

<main>
    <svelte:component this={page} />
</main>

<style>
</style>
