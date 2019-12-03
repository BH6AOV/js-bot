import React, { Component, PureComponent } from 'react';
import { cuid, ENTER_KEY } from '../common';
import { Modal, TextDiv, Button, targetLinkAttr } from './pd';
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
                <span className='cq-label-contact-title'>[ 控制台 ]</span>
                <a className='cq-label-doc' href={cq.GITHUB_URL} {...targetLinkAttr}>文档</a>
                <span className='cq-label-playmode'>控制台模式</span>
                <span className='cq-label-sendername'>{cq.username}</span>
                <MessageList
                    messages={cq.messages}
                    updatetime={cq.messages.length}
                />
                <MessageInput
                    value={cq.text}
                    onChange={cq.setText}
                    onSubmit={cq.submit}
                />
                <Modal
                    content={cq.modalMsg}
                    onOk={cq.closeModal}
                />
            </div>
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
        return (
            <div id={this.id} className='cq-logging-list'>
                <div className='cq-mlist-first'/>
                {messages.map(m => <MessageItem key={m.id} message={m}/>)}
                <div className='cq-mlist-last'/>
            </div>
        );
    }
}

class MessageItem extends PureComponent<{ message: cq.IMessage }> {
    render() {
        return <div className='cq-message-item'><TextDiv text={this.props.message.content}/></div>;
    }
}

interface IPropsMessageInput {
    readonly value: string;
    readonly onChange: (t: string) => any;
    readonly onSubmit: () => any;
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
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                />
                <Button
                    name='发 送'
                    onClick={this.props.onSubmit}
                />
            </div>
        );
    }
}