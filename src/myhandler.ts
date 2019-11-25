// API 文档地址： https://github.com/pandolia/coolq-react

import Contact from './cq/Contact';
import cq from './cq';

export default {
    onMessage: async (contact: Contact, message: IMessage) => {
        if (message.content !== '-joke') {
            return;
        }

        const joke = await cq.ai.joke();
        await contact.send(joke);
        cq.popModal('发送笑话成功.');
    },

    onCqEvent: async (data: any) => {
        return;
    },
};

/*
也可以粘贴以下代码到 CqConsole 控制台运行：

handler.onMessage = function (contact, message) {
    if (message.content !== '-joke') {
        return;
    }

    return ai.joke()
        .then(function (joke) {
            return contact.send('笑话: ' + joke);
        })
        .then(function () {
            popModal('发送笑话成功.');
        });
}
*/