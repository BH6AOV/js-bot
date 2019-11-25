import React, { PureComponent } from 'react';
import Contact from '../cq/Contact';

interface IProps {
    readonly tableNames: string[];
    readonly tableName: string;
    readonly contacts: Contact[];
}

export default class ContactPanel extends PureComponent {

    render() {
        return (
            <div className='cq-contact-panel'>
                111
            </div>
        );
    }
}