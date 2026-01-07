<script lang="ts">
	import { browser } from '$app/environment';
	import { activeTabId } from '$lib/stores/tabStore';
	import { Input } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { _, locale } from 'svelte-i18n';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		class?: ClassValue | undefined | null;
		value: string;
		saveKey?: string;
	}

	let { class: customClass ,
		value,
		saveKey}: Props = $props();

	onMount	(() => {
		if (browser && saveKey) {
			const saved = localStorage.getItem(saveKey);
			if (saved) {
				value = saved;
			}
		}
	});

	function saveSettings() {
		if (browser && saveKey) {
			localStorage.setItem(saveKey, value);
		}
	}

</script>

<Input
		type="password"
		id="ipc"
		placeholder={$_('selectorPage.ipcPasswordPlaceholder')}
		bind:value={value}
		clearable
		oninput={saveSettings}
	/>