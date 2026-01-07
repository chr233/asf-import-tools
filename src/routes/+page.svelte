<script lang="ts">
	import ErrorCard from '$lib/components/ErrorCard.svelte';
	import MainPage from '$lib/pages/MainPage.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LoadScreen from '$lib/components/LoadScreen.svelte';
	import { initLocale } from '$lib/i18n/index';
</script>

{#await initLocale()}
	<LoadScreen />
{:then}
	<Header class="top-0 right-0 left-0 z-50 w-full flex-none shadow-md" />
	<MainPage />
	<Footer class="flex p-2 shadow-inner sm:p-2" />
{:catch error}
	<ErrorCard {error} />
{/await}
