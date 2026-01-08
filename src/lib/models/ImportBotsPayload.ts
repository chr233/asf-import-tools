/*
 * @Author       : Chr_
 * @Date         : 2025-08-06 22:42:14
 * @LastEditors  : Chr_
 * @LastEditTime : 2025-08-06 22:44:23
 * @Description  :
 */

export interface ImportBotsPayload {
  Enabled: boolean;
  Paused: boolean;
  BotName: string;
  SteamLogin?: string | null | undefined;
  SteamPassword?: string | null | undefined;
  IdentitySecret?: string | null | undefined;
  SharedSecret?: string | null | undefined;
}
