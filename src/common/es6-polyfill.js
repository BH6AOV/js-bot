/* eslint-disable */

import 'react-app-polyfill/ie11';

if (!window.Promise) {
    window.Promise = require('bluebird');
}

if (!window.fetch) {
    require('whatwg-fetch');
}

require('./shim.js');

if (!Array.prototype.includes) {
    Array.prototype.includes = function (obj) {
        return this.some(e => e === obj);
    };
}

if (!Array.prototype.find) {
    Array.prototype.find = function (pred) {
        for (let i = 0, n = this.length; i < n; i++) {
            if (pred(this[i])) {
                return this[i];
            }
        }
        return undefined;
    };
}

if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (pred) {
        for (let i = 0, n = this.length; i < n; i++) {
            if (pred(this[i])) {
                return i;
            }
        }
        return -1;
    };
}

if (!Array.prototype.fill) {
    Array.prototype.fill = function (obj) {
        for (let i = 0, n = this.length; i < n; i++) {
            this[i] = obj;
        }
        return this;
    };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (s, position = 0) {
        return this.substr(position, s.length) === s;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (end) {
        const m = this.length, n = end.length;
        return m >= n && this.slice(m - n) === end;
    };
}

if (!String.prototype.repeat) {
    String.prototype.repeat = function (n) {
        return Array(n).fill(this).join('');
    };
}

if (!Object.values) {
    Object.values = function (obj) {
        const values = [];
        for (let k in obj) {
            values.push(obj[k]);
        }
        return values;
    };
}

if (!Number.isInteger) {
    Number.isInteger = function (num) {
        return Math.floor(num) === num;
    };
}

if (!Object.entries) {
    Object.entries = function (obj) {
        const items = [];
        for (let k in obj) {
            items.push([ k, obj[k] ]);
        }
        return items;
    };
}

if (!Object.assign) {
    Object.assign = function (tar, ...objList) {
        for (let i = 0, n = objList.length; i < n; i++) {
            const obj = objList[i];
            if (obj === undefined || obj === null) {
                continue;
            }
            for (let k in obj) {
                tar[k] = obj[k];
            }
        }
        return tar;
    };
}