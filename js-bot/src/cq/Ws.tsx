import * as cq from './CqStore';

export function api(action: string, params: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
        let hasResp = false;
        const _ws = new WebSocket(cq.apiUrl);
        const body = JSON.stringify({ action, params });
        _ws.addEventListener('open', () => _ws.send(body));
        _ws.addEventListener('close', () => hasResp || reject(new Error('WebSocket Api 服务无法连接')));
        _ws.addEventListener('error', () => reject(new Error('WebSocket Api 服务连接错误')));
        _ws.addEventListener('message', (event) => {
            const { status, data } = JSON.parse(event.data);
            hasResp = true;
            _ws.close();
            if (status !== 'ok') {
                reject(new Error('WebSocket ' + status));
            }
            resolve(data);
        });
    });
}

let ws: WebSocket | null = null;

const abort1 = () => cq.abort('WebSocket Event 服务非正常关闭');

const abort2 = () => cq.abort('WebSocket Event 服务连接错误');

export function connectEventWs() {
    ws = new WebSocket(cq.wsUrl);
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
    const { message_type, user_id, group_id, sender, raw_message, message_id } = data;

    if (message_type === 'private') {
        var from = sender.remark || sender.nickname;
        var contact = cq.buddies._getOrInsert(String(user_id), from);
        var memberQQ = '';
    } else if (message_type === 'group') {
        from = sender.card || sender.nickname || String(sender.user_id);
        memberQQ = String(sender.user_id);
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
            contact = cq.groups._getOrInsert(groupQQ, group_name);
        }
    } else {
        return false;
    }

    const message = contact.addMsg(cq.LEFT, from, raw_message, String(message_id), memberQQ);
    try {
        await cq.handler.onMessage(contact, message);
    } catch (err) {
        console.error(err);
        cq.popModal(`handler.onMessage 出错：${err.message}`);
    }

    return true;
}