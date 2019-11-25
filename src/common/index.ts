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
    return String(_i++);
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