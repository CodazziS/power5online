import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if (Meteor.isServer) {
    Meteor.publish('myAccount', function () {
        if (Meteor.user()) {
            return Meteor.users.find(
                {_id: Meteor.user()._id},
                {
                    fields: {_id: 1, allowNotification: 1, username: 1}
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
                    allowNotification: value,
                },
            });
        }
    },
});

