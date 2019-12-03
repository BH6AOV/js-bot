export async function onCqEvent(data: any, api: (name: string, param: object) => any) {
    console.log(JSON.stringify(data, null, '    '));
}