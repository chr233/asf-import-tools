<script lang="ts">
  import ErrorCard from '$lib/components/ErrorCard.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import LoadScreen from '$lib/components/LoadScreen.svelte';
  import { initLocale } from '$lib/i18n/index';
  import BotListPage from '$lib/pages/BotListPage.svelte';
  import AboutPage from '$lib/pages/AboutPage.svelte';
  import ImportPage from '$lib/pages/ImportPage.svelte';
  import { fade } from 'svelte/transition';

  let activeTab = $state('import');
</script>

<div
  class="text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400 sticky flex h-screen w-full flex-col"
>
  {#await initLocale()}
    <div transition:fade={{ duration: 300 }} class="inset-0 absolute z-50">
      <LoadScreen />
    </div>
  {:then}
    <Header bind:activeTab />

    {#if activeTab === 'bot-list'}
      <BotListPage />
    {:else if activeTab === 'import'}
      <ImportPage />
    {:else if activeTab === 'about'}
      <AboutPage />
    {/if}

    <Footer class="p-2 shadow-inner sm:p-2 flex" />
  {:catch error}
    <ErrorCard {error} />
  {/await}
</div>
