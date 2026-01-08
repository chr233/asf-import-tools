<script lang="ts">
  import { Button, ButtonGroup } from 'flowbite-svelte';
  import { FileImportOutline, GlobeOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
  import { _ } from 'svelte-i18n';

    interface Props {
    activeTab?: string;
  }

  let { activeTab = $bindable('') }: Props = $props();

  const buttons = [
    { id: 'bot-list', icon: UsersGroupOutline, label: 'header.botList' },
    { id: 'import', icon: FileImportOutline, label: 'header.import' },
    { id: 'about', icon: GlobeOutline, label: 'header.about' }
  ];

  function selectTab(tabId: string) {
    activeTab = tabId;
  }
</script>

<div class="flex items-center p-2 dark:bg-gray-800 shadow-md space-x-4 px-8 py-4 sticky top-0 z-10">
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
          <btn.icon  />
          <span class="ml-2">{$_(btn.label)}</span>
        </Button>
      {/each}
    </ButtonGroup>
  </div>
</div>
