import Contact from './Contact';
import ContactTable from './ContactTable';
import { api as _api, openEventWs, closeEventWs } from './Ws';
import * as libs from '../common';
import * as _ai from '../ai';

// 常量

// 联系人类型： 好友/群/无/控制台/自己/虚拟好友
export const BUDDY = 0;
export const GROUP = 1;
export const NOTYPE = 2;
export const CONSOLE = 3;
export const MYSELF = 4;
export const VIRTUAL_BUDDY = 5;

// 联系人列表名称，内部联系人名称
export const TABLE_NAMES = [ '好友', '群', '最近' ];
export const CQ_CONSOLE_NAME = 'CqConsole';
export const DEFALUT_MY_SELF_NAME = 'MySelf';
export const VIRTUAL_BUDDY_NAME = '虚拟好友';

// 消息方向： LEFT 代表消息画在左边， RIGHT 代表消息画在右边
export const LEFT = 0;
export const RIGHT = 1;

// 日志级别
export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;
export const ERROR = 3;

// 日志级别名称
export const LEVEL_NAMES = [ 'DEBUG', 'INFO', 'WARN', 'ERROR' ];

// 环境（见 .env 文件）：项目名称，github 地址，cq-websocket 参数，最近联系人，每个联系人保存的消息总数最大值
export const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME!;
export const GITHUB_URL = process.env.REACT_APP_GITHUB_URL!;
export const DEFAULT_WS_HOST = process.env.REACT_APP_WS_HOST!;
export const DEFAULT_TOKEN = process.env.REACT_APP_TOKEN!;
export const DEFAULT_RECENTS = process.env.REACT_APP_RECENTS!;
export const MAX_MESSAGES_SIZE = parseInt(process.env.REACT_APP_MAX_MESSAGES_SIZE!, 10);

// 类型及接口

// 消息方向： LEFT / RIGHT
export type DirectionType = 0 | 1;

// 消息接口（ onMessage 的第二个参数为 IMessage 对象）
export interface IMessage {
    // 消息方向
    direction: DirectionType;

    // 消息发送方名称
    from: string;

    // 消息内容
    content: string;

    // 群成员账号（仅群消息时有效）
    memberQQ: string;

    // 消息 id
    id: string;

    // 消息发送或接收时间
    time: Date;
}

// 联系人类型： BUDDY / GROUP / NOTYPE / CONSOLE / MYSELF / VIRTUAL_BUDDY
export type ContactType = 0 | 1 | 2 | 3 | 4 | 5;

// 日志级别： DEBUG / INFO / WARN / ERROR
export type LogLevel = 0 | 1 | 2 | 3;

// 事件处理类
export interface IHandler {
    // 好友消息或群消息事件处理函数
    onMessage: (c: Contact, m: IMessage) => any;

    // 其他事件处理函数，事件列表及事件参数见： https://cqhttp.cc/docs/4.12/#/Post?id=事件列表
    onCqEvent: (data: any) => any;
}

export type Contact = Contact;

export type ContactTable = ContactTable;

// 工具函数
export const sleep = libs.sleep;
export const cuid = libs.cuid;
export const nullFunc = libs.nullFunc;

// ai 库，见 src/ai/index.tsx
export const ai = _ai;

// 调用 cqhttp 的 api ，见： https://cqhttp.cc/docs/4.12/#/API?id=api-列表
// 调用示例： await cq.api('send_like', { user_id: 158297369 });
// 注意事项： 第一个参数为 cqhttp-api 名称，前面不含斜杠 "/"
//           第二个参数为 cqhttp-api 参数，与用户 id 相关的字段全部采用 number 类型
export const api = _api;

// 控制台上次命令运行结果
export let ans = null;

// 执行控制台命令
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

// 更新视图
export let update: () => void;

// 事件处理对象
export let handler: IHandler;

// 组件加载后
export async function onMounted(f: () => void, h: IHandler | null = null): Promise<any> {
    update = f;
    handler = {
        onMessage: h ? h.onMessage : nullFunc,
        onCqEvent: h ? h.onCqEvent : nullFunc,
    };
    return initCqWs();
}

// 组件卸载前
export function beforeUnmount() {
    update = nullFunc;
    handler.onMessage = nullFunc;
    handler.onCqEvent = nullFunc;
    closeEventWs();
}

// cqhttp websocket 服务地址、token、最近联系人

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

// 好友列表/群列表/最近联系人列表
export const buddies = new ContactTable(BUDDY);
export const groups = new ContactTable(GROUP);
export const recents = new ContactTable(NOTYPE);
export const tables = [ buddies, groups, recents ];

// 内部联系人
export const cqConsole = new Contact(CONSOLE, String(CONSOLE), CQ_CONSOLE_NAME);
export const mySelf = new Contact(MYSELF, String(MYSELF), DEFALUT_MY_SELF_NAME);
export const virtualBuddy = new Contact(VIRTUAL_BUDDY, String(VIRTUAL_BUDDY), VIRTUAL_BUDDY_NAME);

recents._add(cqConsole);

// 状态变量： 当前联系人列表，当前联系人，搜索框文本，模态信息框文本
export let table = recents;
export let contact = cqConsole;
export let searchText = '';
export let modalMsg = '';

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

// 打印
export function print(line = '') {
    cqConsole.addMsg(LEFT, '', line + '\n');
}

// 清屏
export function clr() {
    setTimeout(() => { cqConsole.clear(5); update(); }, 10);
    return '';
}

// 日志

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

// 显示致命错误模块信息框，点击关闭之后退出并重启 js-bot
let aborted: boolean = false;

export function abort(msg: string) {
    aborted = true;
    showModal('致命错误：' + msg);
}

// 连接 cqhttp 服务
async function initCqWs() {
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

        openEventWs();

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