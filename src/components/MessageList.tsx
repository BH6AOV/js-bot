import React, { PureComponent } from 'react';
import MessageItem from './MessageItem';

interface IProps {
    readonly messages: IMessage[];
    readonly updatetime: number | string;
}

export default class MessageList extends PureComponent<IProps> {
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