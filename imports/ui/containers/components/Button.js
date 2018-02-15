import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class Button extends React.Component {
    render() {
        return (
            <button onClick={this.props.onClick}>
                {this.props.text}
            </button>
        );
    }
}