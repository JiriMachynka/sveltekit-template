<script lang="ts">
  import "../app.pcss";
  import { page } from "$app/stores";
  import { ModeWatcher } from "mode-watcher";
  import { getFlash } from "sveltekit-flash-message";
  import { APP_NAME } from "$lib/config/constants";

  const flash = getFlash(page);
</script>

<svelte:head>
  <title>{APP_NAME}</title>
  <meta name="description" content="Example name" />
</svelte:head>

<ModeWatcher />
<slot />
