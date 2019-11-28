import React, { Component, PureComponent } from 'react';
import { cuid, ENTER_KEY, UP_KEY, DOWN_KEY } from '../common';
import { ButtonGroup, Modal, TextDiv, Button, targetLinkAttr } from './pd';
import * as cq from '../cq/CqStore';
import './CqPanel.css';

(window as any).cq = cq;

export default class CqPanel extends Component<{ handler: cq.IHandler }> {
    componentDidMount() {
        cq.onMounted(this.forceUpdate.bind(this), this.props.handler);
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div id='cq-panel'>
                <ButtonGroup
                    className='cq-table-list'
                    names={cq.TABLE_NAMES}
                    current={cq.table.name}
                    onChange={cq.setTableByName}
                />
                <ContactList
                    table={cq.table}
                    updatetime={cq.table.lastModifiedTime}
                    searchText={cq.searchText}
                    contact={cq.contact}
                    onChange={cq.setContactByQQ}
                />
                <div className='cq-contact-search'>
                    <input
                        placeholder='搜 索'
                        value={cq.searchText}
                        onChange={cq.setSearchText}
                        onKeyDown={cq.chooseContactBySearch}
                    />
                </div>
                <span className='cq-label-contact-title'>{cq.contact.toString()}</span>
                <a className='cq-label-doc' href={cq.GITHUB_URL} {...targetLinkAttr}>文档</a>
                <span className='cq-label-playmode' {...{name: cq.contact.playMode}}>
                    {cq.contact.playMode}
                </span>
                <span className='cq-label-sendername'>{cq.contact.senderName}</span>
                <MessageList
                    messages={cq.contact._messages}
                    updatetime={cq.contact.lastModifiedTime}
                />
                <MessageInput
                    value={cq.contact.editingText}
                    updateTime={cq.contact.lastModifiedTime}
                    disabled={cq.contact.sending}
                    onChange={cq.contact.setEditingText}
                    onRoll={cq.contact._rollText}
                    onSubmit={cq.contact.send}
                />
                <Modal
                    content={cq.modalMsg}
                    onOk={cq.closeModal}
                />
            </div>
        );
    }
}

interface IPropsContactList {
    table: cq.ContactTable;
    updatetime: number | string;
    searchText: string;
    contact: cq.Contact;
    onChange: (t: string) => any;
}

class ContactList extends PureComponent<IPropsContactList> {
    render() {
        const { table, searchText, contact, onChange } = this.props;
        const contacts = searchText
            ? table.filter(c => c.type > cq.NOTYPE || c.name.includes(searchText))
            : table;
        return (
            <ButtonGroup
                className='cq-contact-list'
                names={contacts.map(c => c.label)}
                keys={contacts.map(c => c.qq)}
                current={contact.qq}
                onChange={onChange}
            />
        );
    }
}

interface IPropsMessageList {
    readonly messages: cq.IMessage[];
    readonly updatetime: number | string;
}

class MessageList extends PureComponent<IPropsMessageList> {
    componentDidMount() {
        this.scrollToButtom();
    }

    componentDidUpdate() {
        this.scrollToButtom();
    }

    scrollToButtom() {
        const el = document.getElementById(this.id)!;
        el.scrollTop = el.scrollHeight;
    }

    id = cq.cuid();

    render() {
        const { messages } = this.props;
        const className = (cq.contact.type === cq.CONSOLE) ? 'cq-logging-list' : 'cq-message-list';
        return (
            <div id={this.id} className={className}>
                <div className='cq-mlist-first'/>
                {messages.map(m => <MessageItem key={m.id} message={m}/>)}
                <div className='cq-mlist-last'/>
            </div>
        );
    }
}

class MessageItem extends PureComponent<{ message: cq.IMessage }> {
    render() {
        const { from, content, direction } = this.props.message;
        const className = `cq-message-item${direction ? ' cq-message-item-right' : ''}`;
        return <div className={className}><span>{from}</span><TextDiv text={content}/></div>;
    }
}

interface IPropsMessageInput {
    readonly value: string;
    readonly updateTime: string;
    readonly disabled?: boolean | undefined;
    readonly onChange: (t: string) => any;
    readonly onSubmit: () => any;
    readonly onRoll: (isUp: boolean) => any;
}

class MessageInput extends PureComponent<IPropsMessageInput> {
    id = cuid();

    componentDidMount() {
        this.focus();
    }

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        document.getElementById(this.id)!.focus();
    }

    onChange = (event: any) => this.props.onChange(event.target.value || '');

    // submit on Ctrl/Shift + Enter
    onKeyDown = (event: React.KeyboardEvent) => {
        if (event.keyCode === UP_KEY || event.keyCode === DOWN_KEY) {
            if (this.props.value.includes('\n')) {
                return;
            }
            event.preventDefault();
            this.props.onRoll(event.keyCode === UP_KEY);
            return;
        }

        if (event.keyCode !== ENTER_KEY) {
            return;
        }

        event.preventDefault();
        if (event.ctrlKey || event.shiftKey) {
            this.props.onChange(this.props.value + '\n');
            return;
        }

        this.props.onSubmit();
    }

    render() {
        return (
            <div className='cq-message-input'>
                <textarea
                    id={this.id}
                    value={this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                />
                <Button
                    name='发 送'
                    onClick={this.props.onSubmit}
                    disabled={this.props.disabled}
                />
            </div>
        );
    }
}