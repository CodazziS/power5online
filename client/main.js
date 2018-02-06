import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import Index from '../imports/ui/containers/Index.js';
import Game from '../imports/ui/containers/Game.js';


/* Create session if not exist */
if (localStorage.getItem('user_type') === null) {
    let id = Date.now().toString();
    localStorage.setItem('guest_id', id);
    localStorage.setItem('user_type', 'guest');
    localStorage.setItem('user_name', 'guest' + id);
}
console.log(localStorage.getItem('guest_id'));

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
