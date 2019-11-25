import * as cq from './CqStore';
import api from './Api';

let ws: WebSocket | null = null;

const abort1 = () => cq.abort('WebSocket Event 服务非正常关闭');

const abort2 = () => cq.abort('WebSocket Event 服务连接错误');

export default function connectWs() {
    if (ws) {
        ws.removeEventListener('close', abort1);
        ws.removeEventListener('error', abort2);
        ws.removeEventListener('message', onWsData);
        ws.close();
    }

    ws = new WebSocket(cq.config.wsUrl);
    ws.addEventListener('close', abort1);
    ws.addEventListener('error', abort2);
    ws.addEventListener('message', onWsData);
}

async function onWsData(event: any) {
    const data = JSON.parse(event.data);
    const s = JSON.stringify(data, null, '    ');
    cq.debug(s);
    console.debug(s);

    if (data.post_type === 'message') {
        const r = await onMessageData(data);
        if (r) {
            return;
        }
    }

    try {
        await cq.handler.onCqEvent(data);
    } catch (err) {
        console.error(err);
        cq.popModal(`handler.onCqEvent 出错：${err.message}`);
    }
}

async function onMessageData(data: any): Promise<boolean> {
    const { message_type, user_id, group_id, sender, raw_message } = data;

    if (message_type === 'private') {
        var from = sender.remark || sender.nickname;
        var contact = cq.buddies.getOrInsert(String(user_id), from);
    } else if (message_type === 'group') {
        from = sender.card || sender.nickname || sender.user_id;
        const groupQQ = String(group_id);
        const _contact = cq.groups.get(groupQQ);
        if (_contact) {
            contact = _contact;
        } else {
            try {
                var { group_name } = await api('get_group_inf', { group_id, no_cache: true });
            } catch (err) {
                console.error(err);
                cq.popModal(err.message);
                group_name = groupQQ;
            }
            contact = cq.groups.getOrInsert(groupQQ, group_name);
        }
    } else {
        return false;
    }

    const message = contact.addMessage(from, raw_message, true);

    try {
        await cq.handler.onMessage(contact, message);
    } catch (err) {
        console.error(err);
        cq.popModal(`handler.onMessage 出错：${err.message}`);
    }

    return true;
}