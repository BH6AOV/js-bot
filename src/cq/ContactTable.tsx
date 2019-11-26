import Contact from './Contact';
import * as cq from './CqStore';

export default class ContactTable {
    readonly type: ContactType;
    private readonly _list: Contact[] = [];
    private readonly _dict: Map<string, Contact> = new Map();
    readonly map = this._list.map.bind(this._list);
    readonly forEach = this._list.forEach.bind(this._list);
    readonly filter = this._list.filter.bind(this._list);
    readonly find = this._list.find.bind(this._list);
    lastModifiedTime: string = cq.cuid();
    get length() { return this._list.length; }
    get name() { return cq.TABLE_NAMES[this.type]; }

    constructor(type: ContactType) {
        this.type = type;
    }

    get(qqOrIndex: string | number): Contact | undefined {
        if (typeof(qqOrIndex) === 'string') {
            return this._dict.get(qqOrIndex);
        }
        return this._list[qqOrIndex];
    }

    _getOrInsert(qq: string, name: string): Contact {
        let c = this._dict.get(qq);
        if (c) {
            if (c.name !== name) {
                c.name = name;
                c.lastModifiedTime = cq.cuid();
                this.lastModifiedTime = cq.cuid();
            }
            return c;
        }

        c = new Contact(this.type, qq, name);
        this._list.push(c);
        this._dict.set(c.qq, c);
        this.lastModifiedTime = cq.cuid();
        return c;
    }

    _add(c: Contact) {
        this._list.push(c);
        this._dict.set(c.qq, c);
        this.lastModifiedTime = cq.cuid();
    }

    unshift(c: Contact) {
        if (c.type > cq.NOTYPE) {
            return;
        }

        const i = this._list.indexOf(c);
        if (i === 2) {
            return;
        }

        if (i !== -1) {
            this._list.splice(i, 1);
        } else {
            this._dict.set(c.qq, c);
        }
        this._list.splice(2, 0, c);
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
}