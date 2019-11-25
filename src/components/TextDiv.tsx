import React, { PureComponent } from 'react';
import { cuid } from '../common';

interface IProps {
    readonly text: string;
}

export default class TextDiv extends PureComponent {
    props: IProps = this.props;

    id = `pd-textdiv-${cuid()}`;

    componentDidMount() {
        document.getElementById(this.id)!.innerText = this.props.text;
    }

    render() {
        return <div id={this.id}/>;
    }
}