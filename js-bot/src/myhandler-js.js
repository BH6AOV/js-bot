// API 文档地址： https://github.com/pandolia/coolq-react

// js 版 QQ 机器人程序，如果要使用本文件，请在 index.tsx 文件中改为： import handler from './myhandler.js'

import cq from './cq';

export default {
    onMessage: function (contact, message) {
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
    },

    onCqEvent: function (data) {
        return;
    },
};