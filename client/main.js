import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';
import i18n from 'meteor/universe:i18n';

import Index from '../imports/ui/containers/Index.js';
import Game from '../imports/ui/containers/Game.js';
import Visitor from '../imports/ui/containers/Visitor.js';
import Account from '../imports/ui/containers/Account.js';
import HistoryContainer from '../imports/ui/containers/HistoryContainer.js';
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
        mount(Index, {
            main: <Index/>,
        });
    },
});
FlowRouter.notFound = {
    action() {
        mount(Index, {
            main: <Index/>,
        });
    },
};
/* GAME */
FlowRouter.route('/game/:_id', {
    name: 'game.show',
    action() {
        mount(Game, {
            main: <Game/>,
        });
    },
});

/* Visitor */
FlowRouter.route('/visitor/:_id', {
    name: 'game.spec',
    action() {
        mount(Visitor, {
            main: <Visitor/>,
        });
    },
});

/* Account */
FlowRouter.route('/my-account', {
    name: 'account.edit',
    action() {
        mount(Account, {
            main: <Account/>,
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