export function joke(): Promise<string> {
    return fetch('https://autumnfish.cn/api/joke')
        .then(resp => {
            if (!resp.ok) {
                throw new Error(resp.statusText);
            }
            return resp.text();
        });
}