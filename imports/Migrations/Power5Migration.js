import {Meteor} from 'meteor/meteor';
import {Boards} from '../api/boards.js';
import { Migrations } from 'meteor/percolate:migrations';

function countStep(dots, size) {
    let count = 0;
    let rows = 0;

    for(rows; rows < size; rows++) {
        let cols = 0;
        for (cols; cols < size; cols++) {
            if (dots[rows][cols].state !== null) {
                count ++;
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
                up () {
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
                down () {
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
            Migrations.migrateTo('latest');
        }

    }
}