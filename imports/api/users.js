import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if (Meteor.isServer) {
    Meteor.publish('myUser', function () {
        if (Meteor.user()) {
            return Meteor.users.find(
                {_id: Meteor.user()._id},
                {
                    fields: {_id: 1, power5Notification: 1, username: 1, power5Username: 1}
                }
            );
        }
        return null;
    });

    Meteor.publish('allUsers', function () {
        if (Meteor.user()) {
            return Meteor.users.find(
                {},
                {
                    fields: {_id: 1, power5Username: 1}
                }
            );
        }
        return null;
    });
}

Meteor.methods({
    'users.updateNotification'(value) {
        check(value, Boolean);
        if (Meteor.user()) {
            Meteor.users.update(Meteor.user()._id, {
                $set: {
                    power5Notification: value,
                },
            });
        }
    },

    'users.changePublicUsername'(value) {
        check(value, String);

        if (Meteor.user()) {

            if (value.length < 3) {
                throw new Meteor.Error('username-to-short');
            }


            if (value.toLowerCase() !== Meteor.user().username.toLowerCase() &&
                Meteor.users.find({$text: {$search: value, $caseSensitive :false}}).count() > 0) {
                throw new Meteor.Error('username-already-exist');
            }

            Meteor.users.update(Meteor.user()._id, {
                $set: {
                    power5Username: value,
                },
            });
        }
    },

});

