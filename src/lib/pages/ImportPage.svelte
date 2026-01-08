<script lang="ts">
  import { browser } from '$app/environment';
  import { getBotStatus, startBots, stopBots } from '$lib/api';
  import type { BotDetail } from '$lib/models/IpcGetBotListResponse';
  import { _ } from 'svelte-i18n';

  import { onMount } from 'svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import type { ImportBotsPayload } from '$lib/models/ImportBotsPayload';
  import { Button } from 'flowbite-svelte';
  import type { MaFileData } from '$lib/models/MaFileData';

  interface Props {}

  let {}: Props = $props();

  let ipcPassword: string = $state('');

  let accountText: string = $state('');
  let folderFiles: File[] | null = $state(null);
  let isDragOver: boolean = $state(false);
  let accountCount: number = $derived.by(updateAccountCount);

  let importResult: ImportBotsPayload[] = $derived([]);

  const separatorRegex = /[,， \t]|----/;

  /**
   * 读取账号文件
   * @param file
   */
  function readAccountFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      accountText = content;
    };
    reader.onerror = () => {
      alert('文件读取失败');
    };
    reader.readAsText(file);
  }

  /**
   * 拖拽账号文件导入
   */
  function onAccountFileDrop(event: DragEvent) {
    isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      readAccountFromFile(files[0]);
    }
  }

  /**
   * 选择账号文件导入
   * @param event
   */
  function onSelectAccounts(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target?.files;
    if (files && files.length > 0) {
      const file = files[0];
      readAccountFromFile(files[0]);
    }
  }

  /**
   * 选择令牌文件夹
   */
  async function onSelectMaFiles(event: Event) {
    const target = event.target as HTMLInputElement;

    if (!target?.files) {
      folderFiles = [];
      return;
    }

    const files = Array.from(target?.files);

    if (files.length > 0) {
      // 保存文件列表
      folderFiles = files;
    } else {
      folderFiles = [];
    }
  }

  /**
   * 更新账号数量
   */
  function updateAccountCount(): number {
    if (!accountText) {
      return 0;
    }

    let count = 0;
    const lines = accountText.split('\n');

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const parts = line.split(separatorRegex).filter((x) => x);
      if (parts.length >= 2) {
        count++;
      }
    }

    return count;
  }

  /**
   * 解析账号信息
   * @param text
   */
  function parseAccounts() {
    const lines = accountText.split('\n');
    const result: ImportBotsPayload[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const parts = line.split(separatorRegex).filter((x) => x);

      if (parts.length >= 2) {
        const username = parts[0].trim();
        const password = parts[1].trim();

        result.push({
          Enabled: true,
          Paused: false,
          BotName: username,
          SteamLogin: username,
          SteamPassword: password,
          IdentitySecret: null,
          SharedSecret: null
        });
      }
    }

    return result;
  }

  /**
   * 读取令牌文件
   * @param file
   */
  function readJsonFile(file: File): Promise<MaFileData | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content) as MaFileData;
          resolve(json);
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsText(file);
    });
  }

  /**
   * 执行导入操作
   */
  async function doImport() {
    importResult = [];

    if (folderFiles == null || folderFiles.length === 0) {
      alert('请先选择文件夹');
      return;
    }

    if (!accountText.trim()) {
      alert('请先输入账号信息');
      return;
    }

    // 解析账号信息
    const parsedAccounts = parseAccounts();

    // 创建文件名到文件的映射
    const fileMap: { [key: string]: File } = {};
    for (const file of folderFiles) {
      const fileName = file.name.toString().toLowerCase();
      fileMap[fileName] = file;
    }

    // 为每个账号查找对应的 JSON 文件
    for (const account of parsedAccounts) {
      const fileName = account.BotName + '.mafile';
      const jsonFile = fileMap[fileName];
      if (!jsonFile) {
        continue;
      }

      const jsonData = await readJsonFile(jsonFile);
      if (jsonData) {
        const { identity_secret, shared_secret } = jsonData;
        account.IdentitySecret = identity_secret ?? null;
        account.SharedSecret = shared_secret ?? null;
      }
    }

    importResult = parsedAccounts;
  }

  onMount(() => {});
</script>

<div class="space-y-4 p-4 mx-auto h-full w-full">
  <label class="mb-2 font-medium block" for="ipc">{$_('selectorPage.ipcPassword')}</label>
  <PasswordInput bind:value={ipcPassword} saveKey="asf-ui:ipc-password" />

  <div class="app">
    <!-- 账号信息输入区域 -->
    <div class="section">
      <h2>账号信息</h2>
      <textarea
        bind:value={accountText}
        on:dragover={() => 'isDragOver = true'}
        on:dragleave={() => 'isDragOver = false'}
        on:drop={onAccountFileDrop}
        class:drag-over={isDragOver}
        placeholder="每行一个账号，用 ---- 或者, 分隔账号名和密码&#10;例如：username----password"
      ></textarea>

      <p>
        共 {accountCount} 个机器人账号, 支持拖拽文件到文本框中自动读取内容
      </p>
      <div class="input-group">
        <input type="file" on:change={onSelectAccounts} accept="*/txt" />
      </div>
    </div>

    <!-- 文件夹选择区域 -->
    <div class="section">
      <h2>令牌信息</h2>
      <div class="input-group">
        <input type="file" webkitdirectory multiple on:change={onSelectMaFiles} />
      </div>
    </div>

    <div class="section">
      <Button class="w-full" onclick={doImport}>执行导入</Button>
    </div>

    <!-- 数据表格 -->
    <div class="section">
      <h2>导入结果</h2>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>账号</th>
              <th>密码</th>
              <th>IdentitySecret</th>
              <th>SharedSecret</th>
            </tr>
          </thead>
          <tbody>
            {#if importResult.length === 0}
              <tr>
                <td colspan="4" class="no-data"> 暂无数据，请先输入账号信息并选择文件夹 </td>
              </tr>
            {:else}
              {#each importResult as account}
                <tr>
                  <td>
                    {account.BotName}
                  </td>
                  <td class:null-value={account.SteamLogin === null}>
                    {account.SteamLogin ?? 'null'}
                  </td>
                  <td class:null-value={account.SteamPassword === null}>
                    {account.SteamPassword ?? 'null'}
                  </td>
                  <td class:null-value={account.IdentitySecret === null}>
                    {account.IdentitySecret ?? 'null'}
                  </td>
                  <td class:null-value={account.SharedSecret === null}>
                    {account.SharedSecret ?? 'null'}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
