import { apiSendMsg } from './Api';
import * as cq from './CqStore';

export default class Contact {
    readonly type: ContactType;
    readonly qq: string;
    readonly name: string;
    readonly messages: IMessage[] = [];
    get title() { return `${this.name}（${this.qq}）`; }
    editingText: string = '';
    sending: boolean = false;
    lastModifiedTime: string = cq.cuid();

    constructor(type: ContactType, qq: string, name: string) {
        this.type = type;
        this.qq = qq;
        this.name = name;
        cq.tables[type].add(this);
    }

    clear() {
        const n = this.messages.length;
        if (!n) {
            return;
        }
        this.messages.splice(0, n);
        this.lastModifiedTime = cq.cuid();
    }

    send = async (text = this.editingText): Promise<any> => {
        if (!text) {
            return;
        }

        if (this === cq.cqConsole) {
            this.editingText = '';
            this.addMessage(this.name, text, false);
            try {
                await (window as any).eval(text);
            } catch (err) {
                cq.error(err.message);
            }
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

        this.editingText = '';
        this.addMessage(this.name, text, false);
    }

    _send = async (): Promise<any> => {
        try {
            await this.send(this.editingText);
        } catch (err) {
            console.error(err);
            cq.popModal('发送消息失败：' + err.message);
        }
    }

    addMessage(from: string, content: string, isIn: boolean): IMessage {
        if (this.messages.length === cq.MAX_MESSAGES_SIZE) {
            this.messages.shift();
        }
        const message = { from, content, id: cq.cuid(), isIn };
        this.messages.push(message);
        this.lastModifiedTime = cq.cuid();
        cq.recents.unshift(this);
        if (this === cq.state.contact || cq.recents === cq.state.table) {
            cq.update();
        }
        return message;
    }
}