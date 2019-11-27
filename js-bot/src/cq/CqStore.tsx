import Contact from './Contact';
import ContactTable from './ContactTable';
import { api as _api, connectEventWs } from './Ws';
import * as libs from '../common';
import * as _ai from '../ai';

// constants
export const BUDDY = 0;
export const GROUP = 1;
export const NOTYPE = 2;
export const CONSOLE = 3;
export const MYSELF = 4;
export const VIRTUAL_BUDDY = 5;
export const TABLE_NAMES = [ '好友', '群', '最近' ];
export const CQ_CONSOLE_NAME = 'CqConsole';
export const DEFALUT_MY_SELF_NAME = 'MySelf';
export const VIRTUAL_BUDDY_NAME = '虚拟好友';
export const LEFT = 0;
export const RIGHT = 1;
export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;
export const ERROR = 3;
export const LEVEL_NAMES = [ 'DEBUG', 'INFO', 'WARN', 'ERROR' ];
export const MAX_MESSAGES_SIZE = 400;
export const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME;
export const DEFAULT_WS_HOST = process.env.REACT_APP_WS_HOST;
export const DEFAULT_TOKEN = process.env.REACT_APP_TOKEN;
export const DEFAULT_RECENTS = process.env.REACT_APP_RECENTS;
export const GITHUB_URL = `https://github.com/pandolia/${PROJECT_NAME}`;

// libs
export const sleep = libs.sleep;
export const cuid = libs.cuid;
export const nullFunc = libs.nullFunc;

// ai
export const ai = _ai;

// api
export const api = _api;

// eval
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
        && (cqConsole._messages.length === 0 || libs.last(cqConsole._messages).direction === LEFT)) {
        print();
        return;
    }

    print(`${String(_ans).replace(/\n/g, ' ')}\n`);
}

// view
export let update: () => void;

// handler
export let handler: IHandler;

// init
export function _init(f: () => void, h: IHandler | null = null): Promise<any> {
    update = f;
    handler = h || {
        onMessage: nullFunc,
        onCqEvent: nullFunc,
    };
    return initCqWs();
}

// configurations
export const ws_host = libs.urlParams.get('ws_host')
    || localStorage.ws_host || DEFAULT_WS_HOST;

export const token = libs.urlParams.get('token')
    || localStorage.token || DEFAULT_TOKEN;

export const recents_str = libs.urlParams.get('recents')
    || localStorage.recents_str || DEFAULT_RECENTS;

export const apiUrl = `ws://${ws_host}/api/?access_token=${token}`;

export const wsUrl = `ws://${ws_host}/event/?access_token=${token}`;

function storeConfig() {
    localStorage.ws_host = ws_host;
    localStorage.token = token;
    localStorage.recents_str = recents_str;
}

export function reset(w = DEFAULT_WS_HOST, t = DEFAULT_TOKEN, r = DEFAULT_RECENTS) {
    window.location.href = `?ws_host=${w}&token=${t}&recents=${r}`;
}

// properties
export const buddies = new ContactTable(BUDDY);
export const groups = new ContactTable(GROUP);
export const recents = new ContactTable(NOTYPE);
export const tables = [ buddies, groups, recents ];
export const cqConsole = new Contact(CONSOLE, String(CONSOLE), CQ_CONSOLE_NAME);
export const mySelf = new Contact(MYSELF, String(MYSELF), DEFALUT_MY_SELF_NAME);
export const virtualBuddy = new Contact(VIRTUAL_BUDDY, String(VIRTUAL_BUDDY), VIRTUAL_BUDDY_NAME);

// state
export let table = recents;
export let contact = cqConsole;
export let modalMsg = '';
export let searchText = '';

export function setTableByName(name: string) {
    if (name === table.name) {
        return;
    }
    const tb = tables.find(t => t.name === name);
    if (!tb) {
        return;
    }
    table = tb;
    update();
}

export function setContactByQQ(qq: string) {
    if (qq === contact.qq) {
        return;
    }
    const ct = table.get(qq);
    if (!ct) {
        return;
    }
    contact = ct;
    update();
}

export async function showModal(msg: any) {
    msg = String(msg) || 'null';

    while (modalMsg) {
        await sleep(100);
    }

    modalMsg = msg;
    update();
}

export function closeModal() {
    modalMsg = '';
    update();
    if (aborted) {
        libs.f5();
    }
}

export function popModal(msg: any, t = 2500) {
    showModal(msg);
    setTimeout(closeModal, t);
}

export function setSearchText(event: any) {
    searchText = event.target.value || '';
    update();
}

export function chooseContactBySearch(event: React.KeyboardEvent) {
    if (event.keyCode !== libs.ENTER_KEY) {
        return;
    }

    event.preventDefault();
    if (!searchText) {
        return;
    }
    const c = table.find(ct => ct.name.includes(searchText));
    if (!c) {
        return;
    }
    c.lastModifiedTime = cuid();
    searchText = '';
    contact = c;
    update();
}

// logging
export function print(line = '') {
    cqConsole.addMsg(LEFT, '', line + '\n');
}

export function clr() {
    cqConsole.clear(5);
}

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

// 连接 cqhttp 服务
async function initCqWs() {
    recents._add(cqConsole);

    await sleep(10);

    info(`欢迎使用 js-bot ，cqhttp 服务地址：${ws_host}`);

    try {
        let data = await api('get_login_info');
        mySelf.qq = String(data.user_id);
        mySelf.name = data.nickname;
        recents._add(mySelf);

        data = await api('get_friend_list');
        for (const e of data) {
            buddies._getOrInsert(String(e.user_id), e.remark || e.nickname);
        }
        table = buddies;
        update();

        data = await api('get_group_list');
        for (const e of data) {
            groups._getOrInsert(String(e.group_id), e.group_name);
        }
        table = groups;
        update();

        connectEventWs();

        for (let c of recents_str.split(',')) {
            c = c.trim();
            const type = c.substr(0, 5) === 'buddy' ? BUDDY : GROUP;
            const _contact = tables[type].get(c.substr(5));
            if (!_contact) {
                continue;
            }
            recents._add(_contact);
        }
    } catch (err) {
        error(`启动 ${PROJECT_NAME} 失败：${err.message} ，请确保 cqhttp 服务已开启且配置无误`);
        info(`可在此输入 Javascript 代码运行，在 ${mySelf.label} 窗口进行虚拟聊天`);
        info(`输入 reset('${DEFAULT_WS_HOST}', '${DEFAULT_TOKEN}') 可切换 cqhttp 服务器`);
        info('完整开发手册请点击右上角的“文档”\n');
        if (recents.length === 1) {
            recents._add(mySelf);
        }
        table = recents;
        mySelf.addMsg(RIGHT, mySelf.name, `您好，我是 ${mySelf.name} ，请输入 -joke 等命令进行测试`);
        return;
    }

    storeConfig();
    info(`启动 ${PROJECT_NAME} 成功，用户 ${mySelf.name}（${mySelf.qq}），`
        + `一共 ${buddies.length} 个好友， ${groups.length} 个群`);
    info(`请在此输入 Javascript 代码运行，在 ${mySelf.label} 窗口进行虚拟聊天，在普通联系人窗口直接聊天`);
    info(`输入 reset('${DEFAULT_WS_HOST}', '${DEFAULT_TOKEN}') 可切换 cqhttp 服务器`);
    info('完整开发手册请点击右上角的“文档”\n');
    table = recents;
    mySelf.addMsg(RIGHT, mySelf.name, `您好，我是 ${mySelf.name} ，请输入 -joke 等命令进行测试`);
}