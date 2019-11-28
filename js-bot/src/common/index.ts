import './es6-polyfill.js';

export function sleep(t: number) {
    return new Promise(resolve => setTimeout(resolve, t));
}

export function nullFunc() { }

export const ENTER_KEY = 13;
export const UP_KEY = 38;
export const DOWN_KEY = 40;

let _i = 0;

export function cuid() {
    return 'cuid-' + String(++_i);
}

export function remove<T>(array: T[], el: T): number {
    for (let i = 0, n = array.length; i < n; i++) {
        if (array[i] === el) {
            array.splice(i, 1);
            return i;
        }
    }

    return -1;
}

export function last<T>(array: T[]): T {
    const n = array.length;
    if (n === 0) {
        throw new Error('try to get the  last element of an empty array');
    }
    return array[n - 1];
}

export function f5() {
    // eslint-disable-next-line
    setTimeout(() => { window.location.href = window.location.href; }, 500);
}

function getQueryParams(qs: string): Readonly<Map<string, string>> {
    const params: Map<string, string> = new Map();
    let tokens: any;
    const re = /([^=&]+)=([^&]*)/g;

    qs = qs.substring(1);
    // eslint-disable-next-line
    while (tokens = re.exec(qs)) {
        params.set(decodeURIComponent(tokens[1]), decodeURIComponent(tokens[2]));
    }

    return params;
}

export const urlParams = getQueryParams(window.location.search);

export function clearArray(array: any[]) {
    array.splice(0, array.length);
}