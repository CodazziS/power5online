import { Meteor } from 'meteor/meteor';
import { Boards } from '../../api/boards';
import { withTracker } from 'meteor/react-meteor-data';
import History from './pages/History.js';

export default HistoryContainer = withTracker(() => {
    const boardHandle = Meteor.subscribe('myGamesLite', localStorage.getItem('guest_id'));
    const loading = !boardHandle.ready();
    const boards = Boards.find({}, {sort:{lastActionAt: -1, createdAt: -1}});
    const boardsExist = !loading && !!boards;

    return {
        loading,
        boardsExist,
        games: boardsExist ? boards.fetch() : [],
        gamesCount: boardsExist ? Boards.find().count() : [],
    };
})(History);