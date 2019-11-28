import * as cq from './cq/CqStore';

export async function onMessage(contact: cq.Contact, message: cq.IMessage) {
    if (message.content !== '-joke') {
        return;
    }

    const joke = await cq.ai.joke();
    await contact.send(joke);
    cq.popModal('发送笑话成功.');
}

export async function onCqEvent(data: any) {
    return;
}