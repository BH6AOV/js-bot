import * as cq from './CqStore';

export default function api(action: string, params: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
        let hasResp = false;
        const ws = new WebSocket(cq.config.apiUrl);
        const body = JSON.stringify({ action, params });
        ws.addEventListener('open', () => ws.send(body));
        ws.addEventListener('close', () => hasResp || reject(new Error('WebSocket Api 服务非正常关闭')));
        ws.addEventListener('error', () => reject(new Error('WebSocket Api 服务连接错误')));
        ws.addEventListener('message', (event) => {
            const { status, data } = JSON.parse(event.data);
            hasResp = true;
            ws.close();
            if (status !== 'ok') {
                reject(new Error('WebSocket ' + status));
            }
            resolve(data);
        });
    });
}

export function apiSendMsg(type: ContactType, qq: string, text: string): Promise<any> {
    const _qq = parseInt(qq, 10);
    const data: any = (type === cq.BUDDY)
        ? { messsage_type: 'private', user_id: _qq, message: text, auto_escape: true }
        : { messsage_type: 'group', group_id: _qq, message: text, auto_escape: true };
    return api('send_msg', data);
}