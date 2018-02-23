/*global IndexContainer*/
/*eslint no-undef: "error"*/
import { Meteor } from 'meteor/meteor';
import { Boards } from '../../api/boards';
import { withTracker } from 'meteor/react-meteor-data';
import Index from './pages/Index.js';

export default IndexContainer = withTracker(() => {
    const boardHandle = Meteor.subscribe('myGamesLite', localStorage.getItem('guest_id'));
    const publicBoardHandle = Meteor.subscribe('publicGameLite', localStorage.getItem('guest_id'));
    const userId = (Meteor.user()) ? Meteor.user()._id : localStorage.getItem('guest_id');
    const loading = !boardHandle.ready() || !publicBoardHandle.ready();

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
    const winGames = Boards.find(
        {$and: [
            {end: true},
            {$or: [
                {$and: [{authorId: userId}, {winnerIsAuthor: true}]},
                {$and: [{opponentId: userId}, {winnerIsAuthor: false}]}
            ]}
        ]}
    );
    const loseGames = Boards.find(
        {$and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: userId}, {winnerIsAuthor: false}]},
                        {$and: [{opponentId: userId}, {winnerIsAuthor: true}]}
                    ]}
            ]}
    );
    const drawGames = Boards.find(
        {$and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: userId}, {draw: true}]},
                        {$and: [{opponentId: userId}, {draw: true}]}
                    ]}
            ]}
    );

    return {
        loading,
        launchGames: !loading ? launchGames.fetch() : [],
        lastGames: !loading ? lastGames.fetch() : [],
        findGame: !loading ? findGame.fetch() : [],
        watchGame: !loading ? watchGame.fetch() : [],
        winGames: !loading ? winGames.count() : [],
        loseGames: !loading ? loseGames.count() : [],
        drawGames: !loading ? drawGames.count() : [],
    };
})(Index);