<script lang="ts">
	import { Button, Card } from 'flowbite-svelte';

	export let error: string;

	const repoLink = 'https://github.com/chr233/';
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="p-6">
		<h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
			初始化出错, 请联系售后更新程序
		</h3>
		<p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">
			{error}
		</p>
		{#if repoLink}
			<Button class="w-fit" href={repoLink}>前往仓库页</Button>
		{/if}
	</Card>
</div>
