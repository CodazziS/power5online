import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Users } from '../../api/users.js';

import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Panel from './components/Panel.js';
import ToggleButton from './components/ToggleButton.js';


class Account extends Component {

    switchParam(setting) {

        switch (setting) {
            case 'allowNotification':
                Meteor.call('users.updateNotification', !this.props.account[0][setting]);
                break;
        }
    }

    render() {
        const T = i18n.createComponent();

        if (!this.props.account || !this.props.account[0]) {
            return (<Panel type='warn' text='ACCOUNT_LOADING' />);
        }

        return (
            <div className="container">
                <Header
                    title="MY_ACCOUNT"
                />
                <div className="content">
                    <div className="account_content">
                        <h2><T>SETTINGS_TITLE</T></h2>
                        <ToggleButton
                            check={this.props.account[0].allowNotification}
                            checkOnText='NOTIFICATION_ENABLE'
                            checkOffText='NOTIFICATION_DISABLE'
                            onClick={() => this.switchParam('allowNotification')}
                        />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('myAccount');
    return {
        account: Meteor.users.find().fetch(),
    };
})(Account);