import React, { PureComponent } from 'react';
import './Button.css';

interface IButtonGroupProps {
    readonly className?: string | undefined;
    readonly names: string[];
    readonly updatetime?: string | number | undefined;
    readonly keys?: string[] | undefined;
    readonly current: string;
    readonly onChange: (key: string) => void;
}

export class ButtonGroup extends PureComponent<IButtonGroupProps> {
    onClick = (event: any) => {
        const key = event.target.getAttribute('name');
        const { current, onChange } = this.props;
        if (key === current) {
            return;
        }

        onChange(key);
    }

    render() {
        const { className, names, keys, current } = this.props;
        const { onClick } = this;
        return (
            <div className={className}>
                {(keys || names).map((key, i) => {
                    const name = names[i];
                    const clz = (key === current) ? 'pd-button pd-button-active' : 'pd-button';
                    return <span {...{key, name: key, onClick, className: clz}}>{name}</span>;
                })}
            </div>
        );
    }
}

interface IButtonProps {
    readonly name: string;
    readonly active?: boolean | undefined;
    readonly disabled?: boolean | undefined;
    readonly onClick: () => void;
}

export default class Button extends PureComponent<IButtonProps> {
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