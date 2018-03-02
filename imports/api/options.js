export const Options = new Mongo.Collection('options');

if (Meteor.isServer) {
    Meteor.publish('power5Options', function () {
        return Options.find();
    });

}