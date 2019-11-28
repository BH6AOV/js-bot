// 如果要使用本文件，请在 index.tsx 文件中改为： import handler from './myhandler-js.js'

import * as cq from './cq/CqStore';

export function onMessage (contact, message) {
    if (message.content !== '-joke') {
        return;
    }

    return cq.ai.joke()
        .then(function (joke) {
            return contact.send('笑话: ' + joke);
        })
        .then(function () {
            cq.popModal('发送笑话成功.');
        });
}

// eslint-disable-next-line no-unused-vars
export function onCqEvent(data) {
    return;
}