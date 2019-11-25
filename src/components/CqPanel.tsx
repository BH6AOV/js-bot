import React, { Component, Fragment, PureComponent } from 'react';
import Contact from '../cq/Contact';
import ContactTable from '../cq/ContactTable';
import cq from '../cq';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ButtonGroup } from './Button';
import Modal from './Modal';
import './CqPanel.css';

export default class CqPanel extends Component {
    componentWillMount() {
        cq.init(this.forceUpdate.bind(this));
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
                    contact={cq.state.contact}
                    onChange={cq.setContactByQQ}
                />
                <div className='cq-contact-search'/>
                <div className='cq-contact-title'>
                    {cq.state.contact.title}
                    <a href={cq.GITHUB_URL} target='_blank' rel='noopener noreferrer'>Doc</a>
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

interface IProps {
    table: ContactTable;
    updatetime: number | string;
    contact: Contact;
    onChange: Func<string>;
}

class ContactList extends PureComponent<IProps> {
    render() {
        const { table, contact, onChange } = this.props;
        return (
            <ButtonGroup
                className='cq-contact-list'
                names={table.map(c => c.name)}
                keys={table.map(c => c.qq)}
                current={contact.qq}
                onChange={onChange}
            />
        );
    }
}