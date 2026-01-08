<script lang="ts">
  import { browser } from '$app/environment';
  import { getBotStatus, startBots, stopBots } from '$lib/api';
  import type { BotDetail } from '$lib/models/IpcGetBotListResponse';
  import { _ } from 'svelte-i18n';

  import { onMount } from 'svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import type { ImportBotsPayload } from '$lib/models/ImportBotsPayload';
  import {
    Button,
    Fileupload,
    Alert,
    ButtonGroup,
    Input,
    Helper,
    Skeleton,
    TableBody,
    TableBodyCell,
    Dropzone,
    TableBodyRow,
    TableHead,
    Table,
    Textarea,
    TableHeadCell
  } from 'flowbite-svelte';
  import type { MaFileData } from '$lib/models/MaFileData';
  import LabelFor from '$lib/components/LabelFor.svelte';
  import { InfoCircleSolid } from 'flowbite-svelte-icons';

  interface Props {}

  let {}: Props = $props();

  let ipcPassword: string = $state('');

  let accountText: string = $state('');

  let selectedFiles = $state<FileList | null>(null);
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
      event.preventDefault();
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
          IdentitySecret: undefined,
          SharedSecret: undefined
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
        account.IdentitySecret = identity_secret ?? undefined;
        account.SharedSecret = shared_secret ?? undefined;
      }
    }

    importResult = parsedAccounts;
  }

  function toBooleanString(value: any) {
    return value ? '✅' : '❌';
  }

  onMount(() => {});
</script>

<div class="space-y-4 p-4 mx-auto h-full w-full">
  <LabelFor forId="ipc" text={$_('botListPage.ipcPassword')} />
  <PasswordInput id="ipc" bind:value={ipcPassword} saveKey="asf-ui:ipc-password" />

  <!-- 账号信息输入区域 -->
  <LabelFor forId="accounts" text={$_('importPage.accountInfo')} />
  <div>
    <Textarea
      id="accounts"
      bind:value={accountText}
      ondragover={(e) => e.preventDefault()}
      ondrop={onAccountFileDrop}
      class="min-h-30 w-full"
      placeholder="每行一个账号，用 ---- 或者, 分隔账号名和密码&#10;例如：username----password"
    />

    <Helper class="text-sm text-orange-500 dark:text-orange-400 my-2 text-right">
      共 {accountCount} 个机器人账号, 支持拖拽文件到文本框中自动读取内容
    </Helper>
  </div>

  <Fileupload id="accountFile" clearable bind:files={selectedFiles} onchange={onSelectAccounts} />

  <!-- 文件夹选择区域 -->
  <LabelFor forId="maFiles" text="令牌信息" />
  <Fileupload
    id="maFiles"
    webkitdirectory
    clearable
    bind:files={selectedFiles}
    multiple
    onchange={onSelectMaFiles}
  />
  <!-- <Dropzone
    class="border-gray-300 dark:border-gray-600 rounded-md p-4 border-2 border-dashed text-center"
    ondragover={() => (isDragOver = true)}
    ondragleave={() => (isDragOver = false)}
    ondrop={onAccountFileDrop}
  /> -->

  <Button class="w-[30%]" onclick={doImport}>{$_('importPage.start')}</Button>

  <!-- 数据表格 -->
  <div class="section">
    <LabelFor forId="ipc" text="导入结果" />
    <div class="table-wrapper">
      <Table shadow hoverable striped>
        <TableHead>
          <TableHeadCell>机器人名</TableHeadCell>
          <TableHeadCell>启用</TableHeadCell>
          <TableHeadCell>账号</TableHeadCell>
          <TableHeadCell>密码</TableHeadCell>
          <TableHeadCell>IdentitySecret</TableHeadCell>
          <TableHeadCell>SharedSecret</TableHeadCell>
        </TableHead>

        <TableBody>
          {#if importResult.length === 0}
            <TableBodyRow>
              <TableBodyCell colspan={76}>
                <Alert color="gray">
                  {#snippet icon()}<InfoCircleSolid />{/snippet}
                  <div class="space-x-1">
                    <span>无数据</span>
                  </div>
                </Alert>
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            {#each importResult as bot}
              <TableBodyRow>
                <TableBodyCell>{bot.BotName}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.Enabled)}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.SteamLogin)}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.SteamPassword)}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.IdentitySecret)}</TableBodyCell>
                <TableBodyCell>{toBooleanString(bot.SharedSecret)}</TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
