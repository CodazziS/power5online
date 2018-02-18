import React from 'react';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import AccountsUIWrapper from '../../AccountsUIWrapper.js';

export default class Header extends React.Component {
    render() {
        const T = i18n.createComponent();

        return (
            <header>
                <div className="header_title">
                    <h1><a href="/"><T>{this.props.title}</T></a></h1>
                </div>
                <div className="header_account">
                    <AccountsUIWrapper />
                    <a href="/my-account">{Meteor.user() ? 'Mon compte' : '' }</a>
                </div>
            </header>
        );
    }
}