<script lang="ts">
  import { browser } from '$app/environment';
  import { getBotStatus, getBotList, startBots, stopBots } from '$lib/api';
  import type { BotDetail } from '$lib/models/IpcGetBotListResponse';
  import { _ } from 'svelte-i18n';

  import {
    Alert,
    Button,
    ButtonGroup,
    Input,
    Skeleton,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    Table,
    TableHeadCell,
    TableSearch
  } from 'flowbite-svelte';
  import { InfoCircleSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import PasswordInput from '$lib/components/PasswordInput.svelte';

  interface Props {}

  let {}: Props = $props();

  let ipcPassword: string = $state('');

  let ipcMessage: string = $state('');
  let ipcLoading: boolean = $state(true);

  let botListFilter = $state('');
  let botsList: BotDetail[] = $state([]);

  let filteredBots = $derived.by(() => {
    if (!botListFilter) {
      return botsList;
    }

    const key = botListFilter.toLowerCase();
    return botsList.filter(
      (item) =>
        !botListFilter ||
        (item.BotName && item.BotName.toLowerCase().includes(key)) ||
        (item.NickName && item.NickName.toLowerCase().includes(key)) ||
        (item.SteamId && item.SteamId.toString().toLowerCase().includes(key))
    );
  });

  async function reloadBots() {
    console.log(ipcPassword);

    try {
      ipcLoading = true;

      botsList.length = 0;
      ipcMessage = '';

      const response = await getBotList('ASF', ipcPassword);

      if (!response.Success) {
        console.log(response.Message);

        ipcMessage = response.Message;

        return;
      }

      botsList.length = 0;

      for (const botName in response.Result) {
        const detail = response.Result[botName];
        botsList.push(detail);
      }

      console.log(response);
    } catch (err) {
      console.error(err);
    } finally {
      ipcLoading = false;
    }
  }

  async function startOrStopBot(botName: string, start: boolean = true) {
    try {
      ipcLoading = true;

      const response = start
        ? await startBots(botName, ipcPassword)
        : await stopBots(botName, ipcPassword);

      if (!response.Success) {
        console.error(response.Message);
        ipcMessage = response.Message;
        return;
      }

      reloadBots();
    } catch (err) {
      console.error(err);
    } finally {
      ipcLoading = false;
    }
  }

  function toBooleanString(value: boolean) {
    return value ? '✅' : '❌';
  }

  onMount(() => {
    setTimeout(() => {
      reloadBots();
    }, 1000);
  });
</script>

<div class="space-y-4 p-4 mx-auto h-full w-full">
  <label class="mb-2 font-medium block" for="ipc">{$_('selectorPage.ipcPassword')}</label>
  <PasswordInput bind:value={ipcPassword} saveKey="asf-ui:ipc-password" />

  <div class="space-x-2 flex w-full">
    <Button onclick={reloadBots} loading={ipcLoading}>{$_('selectorPage.reloadBotsList')}</Button>
    <span class="flex-1"></span>
  </div>

  <label class="mb-2 font-medium block" for="password">{$_('selectorPage.botsList')}</label>
  <Input
    clearable
    placeholder={$_('selectorPage.botListFilterPlaceholder')}
    bind:value={botListFilter}
  />

  <Table shadow hoverable striped>
    <TableHead>
      <TableHeadCell>{$_('selectorPage.botName')}</TableHeadCell>
      <TableHeadCell>{$_('selectorPage.nickName')}</TableHeadCell>
      <TableHeadCell>{$_('selectorPage.steamId')}</TableHeadCell>
      <TableHeadCell>锁定</TableHeadCell>
      <TableHeadCell>受限</TableHeadCell>
      <TableHeadCell>令牌</TableHeadCell>
      <TableHeadCell>{$_('selectorPage.operator')}</TableHeadCell>
    </TableHead>

    <TableBody>
      {#if filteredBots.length === 0}
        <TableBodyRow>
          <TableBodyCell colspan={7}>
            {#if ipcLoading}
              <Skeleton size="md" class="my-8" />
            {:else if botsList.length === 0}
              <Alert color="red">
                {#snippet icon()}<InfoCircleSolid />{/snippet}

                <div class="space-x-1">
                  <span>{$_('selectorPage.ipcRequestFailed')}</span>
                  {#if ipcMessage}
                    <span>【{ipcMessage}】</span>
                  {/if}
                </div>
              </Alert>
            {:else}
              <Alert color="orange">
                {#snippet icon()}<InfoCircleSolid />{/snippet}

                <div class="space-x-1">
                  <span>{$_('selectorPage.noBotsFound')}</span>
                </div>
              </Alert>
            {/if}
          </TableBodyCell>
        </TableBodyRow>
      {:else}
        {#each filteredBots as bot}
          <TableBodyRow>
            <TableBodyCell>{bot.BotName}</TableBodyCell>

            {#if bot.IsOnline}
              <TableBodyCell>{bot.NickName}</TableBodyCell>
              <TableBodyCell>{bot.SteamId}</TableBodyCell>
              <TableBodyCell>{toBooleanString(bot.IsLocked)}</TableBodyCell>
              <TableBodyCell>{toBooleanString(bot.IsLimited)}</TableBodyCell>
            {:else}
              <TableBodyCell>-</TableBodyCell>
              <TableBodyCell>-</TableBodyCell>
              <TableBodyCell>-</TableBodyCell>
              <TableBodyCell>-</TableBodyCell>
            {/if}
            <TableBodyCell>{toBooleanString(bot.Has2Fa)}</TableBodyCell>

            <TableBodyCell>
              <ButtonGroup>
                {#if bot.IsOnline}
                  <Button
                    size="xs"
                    onclick={() => {
                      startOrStopBot(bot.BotName, false);
                    }}
                  >
                    {$_('selectorPage.stop')}
                  </Button>
                {:else}
                  <Button
                    size="xs"
                    onclick={() => {
                      startOrStopBot(bot.BotName, true);
                    }}
                  >
                    {$_('selectorPage.start')}
                  </Button>
                {/if}
              </ButtonGroup>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      {/if}
    </TableBody>
  </Table>
</div>
