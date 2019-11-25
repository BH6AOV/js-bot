import Contact from './Contact';
import * as cq from './CqStore';

export default class ContactTable {
    readonly type: ContactType;
    private readonly _list: Contact[] = [];
    private readonly _dict: Map<string, Contact> = new Map();
    readonly map = this._list.map.bind(this._list);
    readonly forEach = this._list.forEach.bind(this._list);
    readonly filter = this._list.filter.bind(this._list);
    lastModifiedTime: string = cq.cuid();
    get size() { return this._list.length; }
    get name() { return cq.TABLE_NAMES[this.type]; }

    constructor(type: ContactType) {
        this.type = type;
    }

    add(c: Contact) {
        this._list.push(c);
        this._dict.set(c.qq, c);
        this.lastModifiedTime = cq.cuid();
    }

    unshift(c: Contact) {
        const i = this._list.indexOf(c);
        if (i === 0) {
            return;
        }

        if (i !== -1) {
            this._list.splice(i, 1);
        } else {
            this._dict.set(c.qq, c);
        }
        this._list.unshift(c);
        this.lastModifiedTime = cq.cuid();
    }

    clear() {
        const n = this._list.length;
        if (!n) {
            return;
        }
        this._list.splice(0, n);
        this._dict.clear();
        this.lastModifiedTime = cq.cuid();
    }

    get(qq: string): Contact | undefined {
        return this._dict.get(qq);
    }
}