import Contact from './Contact';
import ContactTable from './ContactTable';
import _api from './Api';
import connectWs from './Ws';
import * as libs from '../common';
import * as _ai from '../ai';

// constants
export const BUDDY = 0;
export const GROUP = 1;
export const NOTYPE = 2;
export const TABLE_NAMES = [ '好友', '群', '最近' ];
export const CQ_CONSOLE_QQ = '控制台';
export const CQ_CONSOLE_NAME = 'CqConsole';
export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;
export const ERROR = 3;
export const LEVEL_NAMES = [ 'debug', 'info', 'warn', 'error' ];
export const GITHUB_URL = 'https://github.com/pandolia/js-bot';
export const MAX_MESSAGES_SIZE = 500;
export const PROJECT_NAME = 'js-bot';
export const DEFAULT_WS_HOST = 'ws://127.0.0.1:6700';
export const DEFAULT_TOKEN = 'mytoken';
export const DEFAULT_RENCENTS_STR = 'buddy3497303033,group163276112';
export const WELCOME_INFO = '请在此输入 Javascript 代码运行，在普通联系人窗口直接聊天'
    + `\n输入 cq.reset() 或刷新页面重启 ${PROJECT_NAME}`
    + `\n输入 cq.reset('${DEFAULT_WS_HOST}', '${DEFAULT_TOKEN}') 重设服务地址`
    + '\n点击右上角的 Doc 查询帮助';

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

export const w: any = {};

export async function _eval(s: string) {
    let _ans = undefined;
    try {
        _ans = await (window as any).eval(`with(cq){${s}}`);
    } catch (err) {
        error(err.message);
        return;
    }

    ans = _ans;
    if (_ans === undefined && (!cqConsole.messages.length || libs.last(cqConsole.messages).isIn)) {
        return;
    }
    cqConsole.addMessage(CQ_CONSOLE_NAME + '.ans', String(_ans), true);
}

// view
let _update: () => void;

export function update() {
    _update();
}

export function init(f: () => void, h: IHandler = _initialHandler): Promise<any> {
    _update = f;
    _initialHandler = h;
    return reset();
}

// configurations
let _ws_host: string;
let _token: string;
let _recents_str: string;

export const config = {
    get wsHost() { return _ws_host; },
    get apiUrl() { return `${_ws_host}/api/?access_token=${_token}`; },
    get wsUrl() { return `${_ws_host}/event/?access_token=${_token}`; },
};

function loadConfig(ws_host: string, token: string, recents_str: string) {
    _ws_host = ws_host || localStorage.ws_host || DEFAULT_WS_HOST;
    _token = token || localStorage.token || DEFAULT_TOKEN;
    _recents_str = recents_str || localStorage.recents_str || DEFAULT_RENCENTS_STR;
}

function storeConfig() {
    localStorage.ws_host = _ws_host;
    localStorage.token = _token;
    localStorage.recents_str = _recents_str;
}

// properties
export const buddies = new ContactTable(BUDDY);
export const groups = new ContactTable(GROUP);
export const recents = new ContactTable(NOTYPE);
export const tables = [ buddies, groups, recents ];
export const cqConsole = new Contact(NOTYPE, CQ_CONSOLE_QQ, CQ_CONSOLE_NAME);

// user
let _userqq: string;
let _username: string;
export const user = {
    get qq() { return _userqq; },
    get name() { return _username; },
};

// state
let _table: ContactTable;
let _contact: Contact;
let _modal_msg: string;
let _search_text: string;

export const state = {
    get table() { return _table; },
    get contact() { return _contact; },
    get modalMsg() { return _modal_msg; },
    get searchText() { return _search_text; },
};

export function setTableByName(name: string) {
    if (name === _table.name) {
        return;
    }
    const tb = tables.find(t => t.name === name);
    if (!tb) {
        return;
    }
    _table = tb;
    _update();
}

export function setContactByQQ(qq: string) {
    if (qq === _contact.qq) {
        return;
    }
    const ct = _table.get(qq);
    if (!ct) {
        return;
    }
    _contact = ct;
    _update();
}

export async function showModal(msg: any) {
    msg = String(msg) || 'null';

    while (_modal_msg) {
        await sleep(100);
    }

    _modal_msg = msg;
    _update();
}

export function closeModal() {
    _modal_msg = '';
    _update();
    if (_aborted) {
        setTimeout(() => { window.location.href = '/'; }, 500);
    }
}

export function popModal(msg: any, t = 2500) {
    showModal(msg);
    setTimeout(closeModal, t);
}

export function setSearchText(event: any) {
    _search_text = event.target.value || '';
    _update();
}

// logging
let _level: LogLevel;

export function log(level: LogLevel, msg: any) {
    msg = String(msg);
    if (level < _level) {
        return;
    }
    cqConsole.addMessage(CQ_CONSOLE_NAME + '.' + LEVEL_NAMES[level], msg, true);
}

export const debug = log.bind(null, DEBUG);
export const info = log.bind(null, INFO);
export const warn = log.bind(null, WARN);
export const error = log.bind(null, ERROR);

export function clr() {
    cqConsole.clear();
    update();
}

export function setLogLevel(level: LogLevel) {
    _level = level;
}

let _aborted: boolean;

export function abort(msg: string) {
    _aborted = true;
    showModal('致命错误：' + msg);
}

// handler
let _initialHandler: IHandler = {
    onMessage: nullFunc,
    onCqEvent: nullFunc,
};

export const handler: IHandler = {
    onMessage: nullFunc,
    onCqEvent: nullFunc,
};

// 启动
export async function reset(ws_host = '', token = '', recents_str = '') {
    loadConfig(ws_host, token, recents_str);

    tables.forEach(t => t.clear());
    cqConsole.clear();
    recents.unshift(cqConsole);

    _userqq = '';
    _username = 'I';

    _table = recents;
    _contact = cqConsole;
    _modal_msg = '';
    _search_text = '';

    _level = INFO;
    _aborted = false;

    Object.assign(handler, _initialHandler);

    await sleep(10);

    info(`欢迎使用 js-bot ，酷Q WebSocket 地址：${_ws_host}`);

    try {
        let data = await api('get_login_info');
        _userqq = data.user_id;
        _username = data.nickname;

        data = await api('get_friend_list');
        for (const e of data) {
            buddies.getOrInsert(String(e.user_id), e.remark || e.nickname);
        }
        _table = buddies;
        update();

        data = await api('get_group_list');
        for (const e of data) {
            groups.getOrInsert(String(e.group_id), e.group_name);
        }
        _table = groups;
        info(`登录用户：${user.name}（${user.qq}），${buddies.size}个好友，${groups.size}个群`);

        connectWs();

        for (let c of _recents_str.split(',')) {
            c = c.trim();
            const type = c.substr(0, 5) === 'buddy' ? BUDDY : GROUP;
            const contact = tables[type].get(c.substr(5));
            if (!contact) {
                continue;
            }
            recents.unshift(contact);
        }
    } catch (err) {
        _table = recents;
        recents.unshift(cqConsole);
        error(`启动 ${PROJECT_NAME} 失败：${err.message}`
            + `\n请确保酷 Q WebSocket 服务已开启且服务地址无误\n${WELCOME_INFO}`);
        return;
    }

    storeConfig();
    _table = recents;
    recents.unshift(cqConsole);
    info(`启动 ${PROJECT_NAME} 成功\n${WELCOME_INFO}`);
}