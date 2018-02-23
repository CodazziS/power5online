import {Meteor} from 'meteor/meteor';
import {Boards} from '../api/boards.js';
import {Migrations} from 'meteor/percolate:migrations';

function countStep(dots, size) {
    let count = 0;
    let rows = 0;

    for (rows; rows < size; rows++) {
        let cols = 0;
        for (cols; cols < size; cols++) {
            if (dots[rows][cols].state !== null) {
                count++;
            }
        }
    }
    return count;
}

export default class Power5Migration {

    constructor() {
        if (Meteor.isServer) {
            Migrations.add({
                version: 1,
                name: 'Add step filed to games',
                up() {
                    let boards = Boards.find().fetch();
                    let i = 0;
                    for (i in boards) {
                        if (boards.hasOwnProperty(i)) {
                            Boards.update(boards[i]._id, {
                                $set: {
                                    step: countStep(boards[i].dots, boards[i].size)
                                },
                            });
                        }
                    }
                },
                down() {
                    let boards = Boards.find().fetch();
                    let i = 0;
                    for (i in boards) {
                        if (boards.hasOwnProperty(i)) {
                            Boards.update(boards[i]._id, {
                                $set: {
                                    step: null
                                },
                            });
                        }
                    }
                }
            });

            Migrations.add({
                version: 2,
                name: 'Add users power5username, and add power5 prefix for power5 vars',
                up() {
                    let users = Meteor.users.find().fetch();
                    let i = 0;
                    for (i in users) {
                        if (users.hasOwnProperty(i)) {
                            Meteor.users.update(users[i]._id, {
                                $set: {
                                    power5Username: users[i].username,
                                    power5Notification: users[i].allowNotification,
                                    allowNotification: null
                                },
                            });
                        }
                    }
                    Meteor.users.rawCollection().dropIndex('username_text');
                    Meteor.users._ensureIndex(
                        {'power5Username': 'text', username: 'text'},
                        {
                            'weights': {
                                'username': 1,
                                'power5Username': 2
                            },
                            default_language: 'french',
                            name: 'username_text'
                        }
                    );
                },
                down() {
                    let users = Meteor.users.find().fetch();
                    let i = 0;
                    for (i in users) {
                        if (users.hasOwnProperty(i)) {
                            Meteor.users.update(users[i]._id, {
                                $set: {
                                    allowNotification: false
                                },
                            });
                        }
                    }
                }
            });

            Migrations.add({
                version: 3,
                name: 'Fix game date fields',
                up() {
                    let boards = Boards.find().fetch();
                    let i = 0;
                    for (i in boards) {
                        if (boards.hasOwnProperty(i)) {
                            let date = (boards[i].lastActionAt) ? boards[i].lastActionAt : new Date('2017-02-01T00:00:00');
                            let dotsHistory = boards[i].dotsHistory;
                            if (!dotsHistory) {
                                let s;
                                dotsHistory = [];
                                for (s = 0; s <= boards[i].step; s++) {
                                    dotsHistory.push(boards[i].dots);
                                }
                            }
                            Boards.update(boards[i]._id, {
                                $set: {
                                    lastActionAt: date,
                                    dotsHistory
                                },
                            });
                        }
                    }
                },
                down() {
                }
            });
            Migrations.migrateTo(3);
        }

    }
}