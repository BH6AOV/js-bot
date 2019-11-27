import { api } from './Ws';
import * as cq from './CqStore';

export default class Contact {
    type: ContactType;
    qq: string;
    name: string;
    _messages: IMessage[] = [];
    lastModifiedTime: string = cq.cuid();
    temp: string = '';
    editingText: string = this.temp;
    idx: number = 0;
    sending: boolean = false;

    clear(i: number = 0) {
        const n = this._messages.length;
        this._messages.splice(i, n - i);
        this.lastModifiedTime = cq.cuid();
        this.temp = '';
        this.editingText = this.temp;
        this.idx = 0;
        this.sending = false;
    }

    get label() {
        if (this.type > cq.NOTYPE) {
            return `[ ${this.name} ]`;
        }
        return this.name;
    }

    toString() {
        if (this.type === cq.CONSOLE) {
            return '[ 控制台 ]';
        }
        if (this.type === cq.MYSELF) {
            return `[ ${this.name} ]`;
        }
        return `[ ${cq.TABLE_NAMES[this.type]} ${this.name}，${this.qq} ]`;
    }

    get playMode() {
        if (this.type === cq.CONSOLE) {
            return '控制台模式';
        }
        if (this.type === cq.MYSELF) {
            return '虚拟聊天模式';
        }
        return '注意：已进入聊天模式';
    }

    get senderName() {
        return this.type > cq.NOTYPE ? '' : cq.mySelf.name;
    }

    constructor(type: ContactType, qq: string, name: string) {
        this.type = type;
        this.qq = qq;
        this.name = name;
    }

    changeText = (text: string) => {
        if (text === this.editingText) {
            return;
        }

        this.temp = text;
        this.editingText = this.temp;
        this.idx = this._messages.length;
        cq.update();
    }

    _rollText = (isUp: boolean) => {
        const n = this._messages.length;
        if (n === 0) {
            return;
        }

        const step = isUp ? -1 : 1;
        const direction = (this.type !== cq.MYSELF) ? cq.RIGHT : cq.LEFT;
        this._messages.push({ direction, id: '', from: '', content: this.temp });
        for (let i = this.idx + step; ; i += step) {
            if (i === -1) {
                i = n;
            }
            if (i === n + 1) {
                i = 0;
            }

            if (i === this.idx) {
                this._messages.pop();
                break;
            }

            let { direction: _d, content } = this._messages[i];

            if ((this.type !== cq.MYSELF && _d === cq.LEFT)
                || (this.type === cq.MYSELF && _d === cq.RIGHT)) {
                continue;
            }

            if (this.type === cq.CONSOLE) {
                content = content.substr(4).trim();
            }

            if (content.includes('\n') || content === this.editingText) {
                continue;
            }

            this.idx = i;
            this.editingText = content;
            this._messages.pop();
            cq.update();
            break;
        }
    }

    send = async (text = this.editingText): Promise<null> => {
        if (!text) {
            cq.popModal('请勿发送空消息', 2000);
            return null;
        }

        if (this.type === cq.CONSOLE) {
            text = text.trim();
            if (text.includes('\n')) {
                text = '\n' + text;
            }
            this.addMsg(cq.RIGHT, '', `>>> ${text}`);
            cq._eval(text);
            return null;
        }

        if (this.type === cq.MYSELF) {
            const message = this.addMsg(cq.LEFT, cq.virtualBuddy.name, text);
            try {
                await cq.handler.onMessage(cq.virtualBuddy, message);
            } catch (err) {
                console.error(err);
                cq.popModal(`handler.onMessage 出错：${err.message}`);
            }
            return null;
        }

        if (this.type === cq.VIRTUAL_BUDDY) {
            cq.mySelf.addMsg(cq.RIGHT, cq.mySelf.name, text);
            return null;
        }

        while (this.sending) {
            await cq.sleep(100);
        }

        this.editingText = text;
        this.sending = true;
        cq.update();

        const _qq = parseInt(this.qq, 10);
        if (this.type === cq.BUDDY) {
            var data: any = {
                messsage_type: 'private', user_id: _qq, message: text, auto_escape: true,
            };
        } else {
            data = {
                messsage_type: 'group', group_id: _qq, message: text, auto_escape: true,
            };
        }

        try {
            api('send_msg', data);
        } catch (err) {
            console.error(err);
            this.sending = false;
            const e = `发送${cq.TABLE_NAMES[this.type]}消息失败：${err.message}`;
            cq.popModal(e);
            throw new Error(e);
        }

        this.sending = false;
        this.addMsg(cq.RIGHT, cq.mySelf.name, text);
        return null;
    }

    addMsg(direction: DirectionType, from: string, content: string): IMessage {
        if (this.type === cq.VIRTUAL_BUDDY) {
            throw new Error('Try to add message to a virtual buddy');
        }

        if (this._messages.length === cq.MAX_MESSAGES_SIZE) {
            this._messages.shift();
            this.idx--;
            if (this.idx === -1) {
                this.idx = this._messages.length;
                this.temp = this.editingText;
            }
        }

        if (this.idx === this._messages.length) {
            this.idx++;
        }

        const message = { direction, id: cq.cuid(), from, content };
        this._messages.push(message);
        this.lastModifiedTime = cq.cuid();

        if ((this.type !== cq.MYSELF && direction === cq.RIGHT)
            || (this.type === cq.MYSELF && direction === cq.LEFT)) {
            this.temp = '';
            this.editingText = this.temp;
            this.idx = this._messages.length;
        }

        cq.recents.unshift(this);
        if (this === cq.contact || cq.recents === cq.table) {
            cq.update();
        }

        return message;
    }
}