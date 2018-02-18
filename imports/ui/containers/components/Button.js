import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class Button extends React.Component {
    render() {
        const T = i18n.createComponent();

        return (
            <button onClick={this.props.onClick}>
                <T>{this.props.text}</T>
            </button>
        );
    }
}