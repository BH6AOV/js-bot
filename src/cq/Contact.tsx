import { apiSendMsg } from './Api';
import * as cq from './CqStore';

export default class Contact {
    readonly type: ContactType;
    readonly qq: string;
    name: string;

    readonly messages: IMessage[] = [];
    lastModifiedTime: string = cq.cuid();
    idx: number = 0;
    temp: string = '';
    editingText: string = this.temp;
    sending: boolean = false;

    toString() {
        if (this.type === cq.NOTYPE) {
            return '控制台';
        }
        return `${cq.TABLE_NAMES[this.type]} ${this.name} ${this.qq}`;
    }

    get interactType() { return (this.type === cq.NOTYPE) ? '' : '已进入聊天模式'; }

    constructor(type: ContactType, qq: string, name: string) {
        this.type = type;
        this.qq = qq;
        this.name = name;
    }

    clear() {
        const n = this.messages.length;
        if (!n) {
            return;
        }
        this.messages.splice(0, n);
        this.lastModifiedTime = cq.cuid();
        this.idx = 0;
        this.temp = '';
        this.editingText = this.temp;
        this.sending = false;
    }

    changeText = (text: string) => {
        if (text === this.editingText) {
            return;
        }
        this.idx = this.messages.length;
        this.temp = text;
        this.editingText = this.temp;
        cq.update();
    }

    rollText = (isUp: boolean) => {
        const n = this.messages.length;
        if (n === 0) {
            return;
        }

        this.messages.push({ id: '', from: '', isIn: false, content: this.temp });

        const step = isUp ? -1 : 1;

        for (let i = this.idx + step; ; i += step) {
            if (i === -1) {
                i = n;
            }
            if (i === n + 1) {
                i = 0;
            }

            if (i === this.idx) {
                this.messages.pop();
                break;
            }

            if (this.messages[i].isIn || this.messages[i].content === this.editingText) {
                continue;
            }

            this.idx = i;
            this.editingText = this.messages[i].content;
            this.messages.pop();
            cq.update();
            break;
        }
    }

    send = async (text = this.editingText) => {
        if (!text) {
            return;
        }

        if (this === cq.cqConsole) {
            this.addMessage(cq.user.name, text, false);
            cq._eval(text);
            return;
        }

        while (this.sending) {
            await cq.sleep(100);
        }

        this.editingText = text;
        this.sending = true;
        cq.update();

        try {
            await apiSendMsg(this.type, this.qq, text);
        } finally {
            this.sending = false;
        }

        this.addMessage(cq.user.name, text, false);
    }

    _send = async (): Promise<boolean> => {
        try {
            await this.send(this.editingText);
        } catch (err) {
            console.error(err);
            cq.popModal('发送消息失败：' + err.message);
            return false;
        }
        return true;
    }

    addMessage(from: string, content: string, isIn: boolean): IMessage {
        if (this.messages.length === cq.MAX_MESSAGES_SIZE) {
            this.messages.shift();
        }
        const message = { from, content, id: cq.cuid(), isIn };
        this.messages.push(message);
        this.lastModifiedTime = cq.cuid();
        if (!isIn) {
            this.idx = this.messages.length;
            this.temp = '';
            this.editingText = this.temp;
        }
        cq.recents.unshift(this);
        if (this === cq.state.contact || cq.recents === cq.state.table) {
            cq.update();
        }
        return message;
    }
}