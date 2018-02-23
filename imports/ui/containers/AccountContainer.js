/*global AccountContainer*/
/*eslint no-undef: "error"*/
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Account from './pages/Account.js';

export default AccountContainer = withTracker(() => {
    const usersHandle = Meteor.subscribe('myUser');
    const loading = !usersHandle.ready();
    const user = Meteor.users.findOne();
    const usersExist = !loading && !!user;

    return {
        loading,
        usersExist,
        user: usersExist ? user : null,
    };
})(Account);
