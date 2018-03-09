import React from 'react';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import AccountsUIWrapper from '../../AccountsUIWrapper.js';
import Link from './Link.js';

export default class Header extends React.Component {
    render() {
        const T = i18n.createComponent();
        let account;

        if (Meteor.user()) {
            account = <Link href="/my-account" text="COMP_HEADER_MY_ACCOUNT" />;
        } else {
            account = 'guest_' + localStorage.getItem('guest_id');
        }

        return (
            <header>
                <div className="header_title">
                    <h1>
                        <a href="/">
                            <img src="/favicon.png" />
                        </a>
                        <T>{this.props.title}</T>
                    </h1>
                </div>
                <div className="header_account">
                    <AccountsUIWrapper />
                    { account }
                </div>
            </header>
        );
    }
}