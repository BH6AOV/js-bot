import React, { Component, Fragment, PureComponent } from 'react';
import { cuid, ENTER_KEY } from '../common';
import Contact from '../cq/Contact';
import ContactTable from '../cq/ContactTable';
import cq from '../cq';
import { ButtonGroup, Modal, TextDiv, Button, targetLinkAttr } from './pd';
import './CqPanel.css';

export default class CqPanel extends Component<{initialHandler: IHandler}> {
    componentWillMount() {
        cq.init(this.forceUpdate.bind(this), this.props.initialHandler);
    }

    render() {
        return (
            <Fragment>
                <ButtonGroup
                    className='cq-table-list'
                    names={cq.TABLE_NAMES}
                    current={cq.state.table.name}
                    onChange={cq.setTableByName}
                />
                <ContactList
                    table={cq.state.table}
                    updatetime={cq.state.table.lastModifiedTime}
                    searchText={cq.state.searchText}
                    contact={cq.state.contact}
                    onChange={cq.setContactByQQ}
                />
                <div className='cq-contact-search'>
                    <input
                        placeholder='搜 索'
                        value={cq.state.searchText}
                        onChange={cq.setSearchText}
                    />
                </div>
                <div className='cq-contact-title'>
                    {cq.state.contact.toString()}
                    <a href={cq.GITHUB_URL} {...targetLinkAttr}>
                        Doc
                    </a>
                </div>
                <MessageList
                    messages={cq.state.contact.messages}
                    updatetime={cq.state.contact.lastModifiedTime}
                />
                <MessageInput
                    value={cq.state.contact.editingText}
                    disabled={cq.state.contact.sending}
                    onChange={cq.setEditingText}
                    onSubmit={cq.state.contact._send}
                />
                <Modal
                    content={cq.state.modalMsg}
                    onOk={cq.closeModal}
                />
            </Fragment>
        );
    }
}

interface IProps2 {
    table: ContactTable;
    updatetime: number | string;
    searchText: string;
    contact: Contact;
    onChange: Func<string>;
}

class ContactList extends PureComponent<IProps2> {
    render() {
        const { table, searchText, contact, onChange } = this.props;
        const contacts = searchText ? table.filter(c => c.name.includes(searchText)) : table;
        return (
            <ButtonGroup
                className='cq-contact-list'
                names={contacts.map(c => c.name)}
                keys={contacts.map(c => c.qq)}
                current={contact.qq}
                onChange={onChange}
            />
        );
    }
}

interface IProps3 {
    readonly messages: IMessage[];
    readonly updatetime: number | string;
}

class MessageList extends PureComponent<IProps3> {
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

    id = 'cq-message-list';

    render() {
        const { messages } = this.props;
        return (
            <div id={this.id} className={this.id}>
                {messages.map(m => <MessageItem key={m.id} message={m}/>)}
            </div>
        );
    }
}

interface IProps4 {
    readonly message: IMessage;
}

class MessageItem extends PureComponent<IProps4> {
    render() {
        const { from, content, isIn } = this.props.message;
        const className = isIn ? 'cq-message-item' : 'cq-message-item cq-message-item-right';
        return  (
            <div className={className}>
                <span>{from}</span>
                <TextDiv text={content}/>
            </div>
        );
    }
}

interface IProps5 {
    readonly value: string;
    readonly disabled?: boolean | undefined;
    readonly onChange: Func<string>;
    readonly onSubmit: Action;
}

class MessageInput extends PureComponent<IProps5> {
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