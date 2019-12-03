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

const abort1 = async () => {
    await cq.sleep(100);
    cq.abort('WebSocket Event 服务非正常关闭');
};

const abort2 = () => async () => {
    await cq.sleep(100);
    cq.abort('WebSocket Event 服务连接错误');
};

export function openEventWs() {
    ws = new WebSocket(cq.wsUrl);
    ws.addEventListener('close', abort1);
    ws.addEventListener('error', abort2);
    ws.addEventListener('message', onWsData);
}

export function closeEventWs() {
    if (ws === null) {
        return;
    }

    ws.removeEventListener('close', abort1);
    ws.removeEventListener('error', abort2);
    ws.removeEventListener('message', onWsData);
    ws.close();
    ws = null;
}

async function onWsData(event: any) {
    const data = JSON.parse(event.data);
    try {
        await cq.handler.onCqEvent(data, api);
    } catch (err) {
        console.error(err);
        cq.popModal(`handler.onCqEvent 出错：${err.message}`);
    }
}