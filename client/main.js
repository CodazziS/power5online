import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import Index from '../imports/ui/containers/Index.js';
import Game from '../imports/ui/containers/Game.js';
import '../imports/startup/accounts-config.js';

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
