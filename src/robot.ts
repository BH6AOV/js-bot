/*
js 简单版，拷贝以下代码到 CqConsole 输入框，回车发送，或拷贝至 F12 控制台运行。

cq.handler.onMessage = function (contact, message) {
    if (message.content !== '-joke') {
        return;
    }
    fetch('https://autumnfish.cn/api/joke')
        .then(function (resp) {
            return resp.text();
        })
        .then(function (joke) {
            contact.send(joke);
        })
}

typescript 完整版，拷贝以下代码到本文件，运行 npm start 。

import Contact from './cq/Contact';
import * as cq from './cq/CqStore';

export async function onMessage(contact: Contact, message: IMessage): Promise<any> {
    if (message.content !== '-joke') {
        return;
    }

    let joke: string = '';
    try {
        const resp = await fetch('https://autumnfish.cn/api/joke');
        if (!resp.ok) {
            cq.error('获取笑话失败：' + resp.statusText);
            return;
        }
        joke = await resp.text();
    } catch (e) {
        console.error(e);
        cq.error('连接笑话接口失败：' + e.message);
        return;
    }

    const err = await contact.send(joke);
    if (err) {
        cq.error('发送笑话失败：' + err);
        return;
    }

    cq.info('发送笑话成功.');
}

完整 API 文档地址： https://github.com/pandolia/coolq-react
*/

import Contact from './cq/Contact';

export async function onMessage(contact: Contact, message: IMessage): Promise<any> {
    return;
}