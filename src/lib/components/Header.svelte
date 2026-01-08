<script lang="ts">
  import { Tabs, TabItem, Button, ButtonGroup } from 'flowbite-svelte';
  import { _ } from 'svelte-i18n';
  import { UserCircleSolid, GridSolid, ClipboardSolid } from 'flowbite-svelte-icons';

  import BotListPage from '$lib/pages/BotListPage.svelte';
  import AboutPage from '$lib/pages/AboutPage.svelte';
  import ImportPage from '$lib/pages/ImportPage.svelte';
  interface Props {
    activeTab?: string;
  }

  let { activeTab = $bindable('') }: Props = $props();

  const buttons = [
    { id: 'bot-list', icon: UserCircleSolid, label: $_('header.botList') },
    { id: 'import', icon: ClipboardSolid, label: $_('header.import') },
    { id: 'about', icon: GridSolid, label: $_('header.about') }
  ];

  function selectTab(tabId: string) {
    activeTab = tabId;
  }
</script>

<div class="flex items-center p-2 dark:bg-gray-800 shadow-md space-x-4">
  <!-- 标题：在小屏隐藏 -->
  <h1 class="text-lg font-semibold hidden sm:block">{$_('title') ?? 'ASF Import Tools'}</h1>

  <!-- 按钮靠右显示，图标在小屏可见，标签在 sm 及以上显示 -->
  <div class="ml-auto">
    <ButtonGroup>
      {#each buttons as btn}
        <Button
          pill
          color={activeTab === btn.id ? 'primary' : 'light'}
          size="xs"
          onclick={() => selectTab(btn.id)}
        >
          <btn.icon class="h-4 w-4" />
          <span class="ml-2">{btn.label}</span>
        </Button>
      {/each}
    </ButtonGroup>
  </div>
</div>
