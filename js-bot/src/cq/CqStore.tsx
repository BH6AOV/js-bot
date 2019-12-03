import { api as _api, openEventWs, closeEventWs } from './Ws';
import * as libs from '../common';

export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;
export const ERROR = 3;

export const LEVEL_NAMES = [ 'DEBUG', 'INFO', 'WARN', 'ERROR' ];

export const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME!;
export const GITHUB_URL = process.env.REACT_APP_GITHUB_URL!;
export const DEFAULT_WS_HOST = process.env.REACT_APP_WS_HOST!;
export const DEFAULT_TOKEN = process.env.REACT_APP_TOKEN!;
export const MAX_MESSAGES_SIZE = parseInt(process.env.REACT_APP_MAX_MESSAGES_SIZE!, 10);

export type LogLevel = 0 | 1 | 2 | 3;

export interface IHandler {
    onCqEvent: (data: any, api: (name: string, param: object) => any) => any;
}

export const sleep = libs.sleep;
export const cuid = libs.cuid;
export const nullFunc = libs.nullFunc;

export const api = _api;

export let ans = null;

export async function _eval(s: string) {
    let _ans = undefined;
    try {
        _ans = await (window as any).eval(`with(cq){${s}}`);
    } catch (err) {
        print(`${err.name}: ${err.message}\n`);
        return;
    }

    ans = _ans;

    if (_ans === undefined
        && ( messages.length === 0 || !(libs.last(messages).content.startsWith('>>> '))) ) {
        print();
        return;
    }

    print(`${String(_ans).replace(/\n/g, ' ')}\n`);
}

export let update: () => void;

export let handler: IHandler;

export async function onMounted(f: () => void, h: IHandler | null = null): Promise<any> {
    update = f;
    handler = {
        onCqEvent: h ? h.onCqEvent : nullFunc,
    };
    return initCqWs();
}

export function beforeUnmount() {
    update = nullFunc;
    handler.onCqEvent = nullFunc;
    closeEventWs();
}

export const ws_host = libs.urlParams.get('ws_host') || localStorage.ws_host || DEFAULT_WS_HOST;

export const token = libs.urlParams.get('token') || localStorage.token || DEFAULT_TOKEN;

export const apiUrl = `ws://${ws_host}/api/?access_token=${token}`;

export const wsUrl = `ws://${ws_host}/event/?access_token=${token}`;

function storeConfig() {
    localStorage.ws_host = ws_host;
    localStorage.token = token;
}

export function reset(w = DEFAULT_WS_HOST, t = DEFAULT_TOKEN) {
    window.location.href = `?ws_host=${w}&token=${t}`;
}

export interface IMessage {
    id: string;
    content: string;
}

export let text = '';
export let messages: IMessage[] = [];
export let modalMsg = '';

function addMsg(t: string) {
    messages.push({ id: cuid(), content: t });
    update();
}

export function setText(t: string) {
    text = t;
    update();
}

export function submit() {
    if (!text) {
        return;
    }
    const t = text;
    text = '';
    addMsg('>>> ' + t);
    _eval(t);
}

export async function showModal(msg: any) {
    msg = String(msg) || 'null';

    while (modalMsg) {
        await sleep(100);
    }

    modalMsg = msg;
    update();
    return null;
}

export function closeModal() {
    modalMsg = '';
    update();
    if (aborted) {
        libs.f5();
    }
    return null;
}

export function popModal(msg: any, t = 2500) {
    showModal(msg);
    setTimeout(closeModal, t);
    return null;
}

export function print(line = '') {
    addMsg(line + '\n');
}

export function clr() {
    setImmediate(_clr);
    return '';
}

function _clr() {
    const n = messages.length;
    messages.splice(numWelcomeLogs, n - numWelcomeLogs);
    update();
}

export let numWelcomeLogs: number;

export let level: LogLevel = INFO;

export function setLogLevel(_level: LogLevel) {
    level = _level;
}

export function log(_level: LogLevel, msg: any) {
    msg = String(msg);
    if (_level < level) {
        return;
    }
    print(`[${LEVEL_NAMES[_level]}] ${msg}`);
}

export const debug = log.bind(null, DEBUG);
export const info = log.bind(null, INFO);
export const warn = log.bind(null, WARN);
export const error = log.bind(null, ERROR);

let aborted: boolean = false;

export function abort(msg: string) {
    aborted = true;
    showModal('致命错误：' + msg);
}

export let userqq: string;
export let username: string;

async function initCqWs() {
    info(`欢迎使用 js-bot ，cqhttp 服务地址：${ws_host}`);

    try {
        const data = await api('get_login_info');
        userqq = String(data.user_id);
        username = data.nickname;
        openEventWs();
    } catch (err) {
        error(`启动 ${PROJECT_NAME} 失败：${err.message} ，请确保 cqhttp 服务已开启且配置无误`);
        info(`输入 reset('${DEFAULT_WS_HOST}', '${DEFAULT_TOKEN}') 可切换 cqhttp 服务器`);
        info('完整开发手册请点击右上角的“文档”\n');
        numWelcomeLogs = messages.length;
        return;
    }

    storeConfig();
    info(`启动 ${PROJECT_NAME} 成功，用户 ${username}（${userqq}）`);
    info(`输入 reset('${DEFAULT_WS_HOST}', '${DEFAULT_TOKEN}') 可切换 cqhttp 服务器`);
    info('完整开发手册请点击右上角的“文档”\n');
    numWelcomeLogs = messages.length;
}