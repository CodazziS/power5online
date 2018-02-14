import React from 'react';
import AccountsUIWrapper from '../../AccountsUIWrapper.js';

export default class Header extends React.Component {
    render() {
        const T = i18n.createComponent();
        return (
            <header>
                <h1><a href="/"><T>{this.props.title}</T></a></h1>
                <AccountsUIWrapper />
            </header>
        );
    }
}