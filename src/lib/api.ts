/*
 * @Author       : Chr_
 * @Date         : 2026-01-07 22:08:29
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-08 14:52:21
 * @Description  : 
 */

import type { IpcGetBotsResponse } from './models/IpcGetBotListResponse';
import type { IpcBasicResponse } from './models/IpcBasicResponse';

async function baseRequest<T>(
	method: string = 'GET',
	uri: string = '',
	ipcPassword?: string
): Promise<T> {
	const response = await fetch(uri, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(ipcPassword ? { Authentication: ipcPassword } : {})
		}
	});
	const data = await response.json();
	return data;
}

export async function getBotList(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcGetBotsResponse> {
	const response = await baseRequest<IpcGetBotsResponse>(
		'GET',
		`/Api/Import/GetBotList/${botNames}`,
		ipcPassword
	);
	return response;
}

export async function getBotStatus(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcGetBotsResponse> {
	const response = await baseRequest<IpcGetBotsResponse>(
		'GET',
		`/Api/Bot/${botNames}`,
		ipcPassword
	);
	return response;
}

export async function startBots(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>(
		'POST',
		`/Api/Bot/${botNames}/start`,
		ipcPassword
	);
	return response;
}

export async function stopBots(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>(
		'POST',
		`/Api/Bot/${botNames}/stop`,
		ipcPassword
	);
	return response;
}


