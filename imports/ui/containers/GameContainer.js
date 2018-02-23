import { Meteor } from 'meteor/meteor';
import { Boards } from '../../api/boards';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Game from './pages/Game.js';

export default GameContainer = withTracker(() => {
    const boardHandle = Meteor.subscribe('myGames', localStorage.getItem('guest_id'));
    const boardAuthHandle = Meteor.subscribe('gameAuthorization', FlowRouter.getParam('_id'));
    Meteor.subscribe('myUser');
    const loading = !boardHandle.ready() || !boardAuthHandle.ready();
    const board = Boards.findOne(FlowRouter.getParam('_id'));
    const boardExist = !loading && !!board;

    return {
        loading,
        boardExist,
        board: boardExist ? board : null,
    };
})(Game);