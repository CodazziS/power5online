import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class Link extends React.Component {
    render() {
        const T = i18n.createComponent();

        return (
            <a href={this.props.href}><T>{this.props.text}</T></a>
        );
    }
}