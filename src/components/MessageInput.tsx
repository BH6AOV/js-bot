import React, { PureComponent } from 'react';
import { cuid, ENTER_KEY } from '../common';
import Button from './Button';

interface IProps {
    readonly value: string;
    readonly disabled?: boolean | undefined;
    readonly onChange: Func<string>;
    readonly onSubmit: Action;
}

export default class MessageInput extends PureComponent<IProps> {
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