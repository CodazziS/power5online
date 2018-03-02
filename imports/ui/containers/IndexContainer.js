/*global IndexContainer*/
/*eslint no-undef: "error"*/
import { Meteor } from 'meteor/meteor';
import { Boards } from '../../api/boards';
import { Options } from '../../api/options';
import { withTracker } from 'meteor/react-meteor-data';
import Index from './pages/Index.js';

export default IndexContainer = withTracker(() => {
    const boardHandle = Meteor.subscribe('myGamesLite', localStorage.getItem('guest_id'));
    const publicBoardHandle = Meteor.subscribe('publicGameLite', localStorage.getItem('guest_id'));
    const userId = (Meteor.user()) ? Meteor.user()._id : localStorage.getItem('guest_id');
    Meteor.subscribe('myUser');
    const podiumdHandle = Meteor.subscribe('power5Options');

    const loading = !boardHandle.ready() || !publicBoardHandle.ready() || !podiumdHandle.ready();

    const user = Meteor.users.findOne();
    const podium = Options.findOne({name: 'podium'});
    const usersExist = !loading && !!user;

    const launchGames = Boards.find(
        {$and: [{end: false}, {$or: [{authorId: userId}, {opponentId: userId}]}]},
        {sort:{lastActionAt: -1, createdAt: -1}}
    );
    const lastGames = Boards.find(
        {$and: [{end: true}, {$or: [{authorId: userId}, {opponentId: userId}]}]},
        {sort:{lastActionAt: -1, createdAt: -1}, limit: 5}
    );
    const findGame = Boards.find(
        {$and: [{opponentId: null}, {authorId: { $ne: userId }}, {private: false}]},
        {sort:{lastActionAt: -1, createdAt: -1}}
    );
    const watchGame = Boards.find(
        {$and: [{end: false}, {opponentId: { $ne: null }}, {private: false}]},
        {sort:{lastActionAt: -1, createdAt: -1}}
    );

    return {
        loading,
        launchGames: !loading ? launchGames.fetch() : [],
        lastGames: !loading ? lastGames.fetch() : [],
        findGame: !loading ? findGame.fetch() : [],
        watchGame: !loading ? watchGame.fetch() : [],
        podium: !loading ? podium : [],
        // winGames: !loading ? winGames.count() : [],
        // loseGames: !loading ? loseGames.count() : [],
        // drawGames: !loading ? drawGames.count() : [],
        usersExist,
        user: usersExist ? user : null,
    };
})(Index);