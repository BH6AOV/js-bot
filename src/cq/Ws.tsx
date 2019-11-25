import * as cq from './CqStore';

export default function connectWs(): Promise<any> {
    const ws = new WebSocket(cq.config.wsUrl);
    ws.addEventListener('close', () => cq.abort('WebSocket Event 服务非正常关闭'));
    ws.addEventListener('error', () => cq.abort('WebSocket Event 服务连接错误'));
    ws.addEventListener('message', onWsData);
    return new Promise(resolve => ws.addEventListener('open', () => resolve()));
}

function onWsData(event: any) {
    const data = JSON.parse(event.data);
    const s = JSON.stringify(data, null, '    ');
    cq.debug(s);
    console.debug(s);

    if (data.post_type === 'message') {
        if (onMessageData(data)) {
            return;
        }
        // other
    }

    // other event
}

function onMessageData(data: any): boolean {
    const { message_type, user_id, group_id, sender, raw_message } = data;

    if (message_type === 'private') {
        var contact = cq.buddies.get(String(user_id));
        if (!contact) {
            return false;
        }
        var from = contact.name;
    } else if (message_type === 'group') {
        contact = cq.groups.get(String(group_id));
        if (!contact) {
            return false;
        }
        from = sender.card || sender.nickname || sender.user_id;
    } else {
        return false;
    }

    const message = contact.addMessage(from, raw_message, true);

    setImmediate(() => cq.handler.onMessage(contact!, message));

    return true;
}