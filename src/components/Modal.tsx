import React, { PureComponent } from 'react';
import Button from './Button';
import './pd.css';

interface IProps {
    readonly content: JSX.Element | string | null | undefined;
    readonly onOk: Action;
}

export default class Modal extends PureComponent<IProps> {
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