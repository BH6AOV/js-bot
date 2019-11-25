import React, { PureComponent } from 'react';
import TextDiv from './TextDiv';

interface IProps {
    readonly message: IMessage;
}

export default class MessageItem extends PureComponent<IProps> {
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