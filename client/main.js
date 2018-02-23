import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';
import i18n from 'meteor/universe:i18n';

import AccountContainer from '../imports/ui/containers/AccountContainer.js';
import GameContainer from '../imports/ui/containers/GameContainer.js';
import HistoryContainer from '../imports/ui/containers/HistoryContainer.js';
import IndexContainer from '../imports/ui/containers/IndexContainer.js';
import VisitorContainer from '../imports/ui/containers/VisitorContainer.js';

import '../imports/startup/accounts-config.js';


/* Language */
function getLang () {
    let lang = navigator.languages && navigator.languages[0] ||
        navigator.language ||
        navigator.browserLanguage ||
        navigator.userLanguage ||
        'en-US';

    // Allow only languages with available translations
    if (!i18n.getLanguages().includes(lang)) {
        return 'fr_FR';
    }
    return lang;
}
i18n.setLocale(getLang());

/* Create session if not exist */
if (localStorage.getItem('guest_id') === null) {
    let id = Date.now().toString();
    localStorage.setItem('guest_id', id);
}

/* INDEX */
FlowRouter.route('/', {
    name: 'Index',
    action() {
        mount(IndexContainer, {
            main: <IndexContainer/>,
        });
    },
});
FlowRouter.notFound = {
    action() {
        mount(IndexContainer, {
            main: <IndexContainer/>,
        });
    },
};
/* GAME */
FlowRouter.route('/game/:_id', {
    name: 'game.show',
    action() {
        mount(GameContainer, {
            main: <GameContainer/>,
        });
    },
});

/* Visitor */
FlowRouter.route('/visitor/:_id', {
    name: 'game.spec',
    action() {
        mount(VisitorContainer, {
            main: <VisitorContainer/>,
        });
    },
});

/* Account */
FlowRouter.route('/my-account', {
    name: 'account.edit',
    action() {
        mount(AccountContainer, {
            main: <AccountContainer/>,
        });
    },
});

/* History */
FlowRouter.route('/history/:page?', {
    name: 'account.history',
    action() {
        mount(HistoryContainer, {
            main: <HistoryContainer/>,
        });
    },
});