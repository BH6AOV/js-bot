import React, { PureComponent } from 'react';
import { cuid } from '../common';
import './pd.css';

export class TextDiv extends PureComponent<{text: string}> {
    id = `pd-textdiv-${cuid()}`;

    componentDidMount() {
        document.getElementById(this.id)!.innerText = this.props.text;
    }

    render() {
        return <div id={this.id}/>;
    }
}

interface IButtonProps {
    name: string;
    active?: boolean | undefined;
    disabled?: boolean | undefined;
    onClick: () => void;
}

export class Button extends PureComponent<IButtonProps> {
    onClick = () => this.props.disabled || this.props.onClick();

    render() {
        const { name, active, disabled } = this.props;
        const { onClick } = this;
        const classNames = [
            'pd-button',
            active ? 'pd-button-active' : '',
            disabled ? 'pd-button-disabled' : '',
        ];
        const className = classNames.join(' ');
        return <span onClick={onClick} className={className}>{name}</span>;
    }
}

interface IProps {
    content: JSX.Element | string | null | undefined;
    onOk: () => any;
}

export class Modal extends PureComponent<IProps> {
    render() {
        const { content, onOk } = this.props;
        const style1 = { display: content ? undefined : 'none' };
        return (
            <div className='pd-modal' style={style1}>
                <div className='pd-modal-box' style={style1}>
                    <Button name='×' onClick={onOk}/>
                    <div className='pd-modal-content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

export const targetLinkAttr = { target: '_blank', rel: 'noopener noreferrer' };