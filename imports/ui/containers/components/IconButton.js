import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class IconButton extends React.Component {
    render() {
        const T = i18n.createComponent();

        return (
            <button onClick={this.props.onClick} className="iconbutton" title={i18n.__(this.props.text)}>
                <i className="material-icons">{this.props.icon}</i>
            </button>
        );
    }
}