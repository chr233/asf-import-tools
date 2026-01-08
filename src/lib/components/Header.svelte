<script lang="ts">
  import { browser } from '$app/environment';
  import { Button, ButtonGroup, DarkMode } from 'flowbite-svelte';
  import {
    FileImportOutline,
    GlobeOutline,
    LanguageOutline,
    UsersGroupOutline
  } from 'flowbite-svelte-icons';
  import { _, locale } from 'svelte-i18n';
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

  function toggleLang() {
    if ($locale === 'en-us') {
      $locale = 'zh-cn';
    } else {
      $locale = 'en-us';
    }

    if (browser) {
      localStorage.setItem('locale', $locale);
    }
  }
</script>

<div class="p-2 dark:bg-gray-800 shadow-md space-x-4 px-8 py-4 top-0 sticky z-10 flex items-center">
  <!-- 标题：在小屏隐藏 -->
  <h1 class="text-lg font-semibold sm:block hidden">{$_('title') ?? 'ASF Import Tools'}</h1>

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
          <btn.icon />
          <span class="ml-2">{$_(btn.label)}</span>
        </Button>
      {/each}
    </ButtonGroup>
  </div>

  <DarkMode />

  <Button
    color="light"
    size="xs"
    class="text-gray-500 dark:text-gray-400 border-0 focus-within:ring-0 dark:border-0 dark:focus-within:ring-0 dark:hover:border-0"
    onclick={toggleLang}
    title={$_('changeLanguage')}
  >
    <LanguageOutline />
  </Button>
</div>
