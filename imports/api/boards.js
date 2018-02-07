import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Boards = new Mongo.Collection('boards');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('boards', function boardPublication(guest_id) {
        return Boards.find({
            $or: [
                { authorId: this.userId },
                { opponentId: this.userId },
                { authorId: guest_id },
                { opponentId: guest_id },
                { opponentId: null },
            ],
        });
    });
}

Meteor.methods({

    'boards.insert'(game) {
        let user_id = null;
        let user_name = null;
        let user_type = null;

        check(game.size, Number);
        check(game.game, String);

        if (game.size < 6 || game.size > 20) {
            return null;
        }

        if (Meteor.user()) {
            user_id = Meteor.user()._id;
            user_name = Meteor.user().username;
            user_type = 'meteor';
        } else {
            check(game.guest_id, String);
            user_id = game.guest_id;
            user_name = 'guest_' + user_id;
            user_type = 'guest';
        }
        return Boards.insert({
            size: game.size,
            game: game.game,
            dots: dotsGeneration(game.size),
            whiteIsNext: true,
            creatorIsWhite: true,
            authorType: user_type,
            authorId: user_id,
            authorUsername: user_name,
            opponentType: null,
            opponentId: null,
            opponentUsername: null,
            createdAt: new Date(),
            end: false,
            winnerIsAuthor: false,
            draw: false
        });
    },

    'boards.setOpponent'(gameId, guest) {
        let user_id = null;
        let user_name = null;
        let user_type = null;

        check(gameId, String);
        if (Meteor.user()) {
            user_id = Meteor.user()._id;
            user_name = Meteor.user().username;
            user_type = 'meteor';
        } else {
            check(guest, String);
            user_id = guest;
            user_name = 'guest_' + user_id;
            user_type = 'guest';
        }

        Boards.update(gameId, {
            $set: {
                opponentType: user_type,
                opponentId: user_id,
                opponentUsername: user_name,
                creatorIsWhite: (Math.floor(Math.random() * Math.floor(2)) === 1),
            },
        });
    },

    'boards.addDot'(gameId, row, col, guest) {
        let user_id = null;
        const board = Boards.findOne(gameId);
        const whitePlayer = (board.creatorIsWhite === true) ? board.authorId :  board.opponentId;
        const blackPlayer = (board.creatorIsWhite === false) ? board.authorId :  board.opponentId;
        let dots = board.dots;

        check(gameId, String);
        if (Meteor.user()) {
            user_id = Meteor.user()._id;
        } else {
            check(guest, String);
            user_id = guest;
        }
        if (!board.opponentId || dots[row][col].state || board.end) {
            // throw new Meteor.Error('opponent-not-found', "Can't find opponent");
            return;
        }
        if ((board.whiteIsNext && !(whitePlayer === user_id || whitePlayer === guest)) ||
            (!board.whiteIsNext && !(blackPlayer === user_id || blackPlayer === guest))) {
            // throw new Meteor.Error('bad-player', "It's not your round");
            return;
        }

        dots[row][col].state = board.whiteIsNext ? "white" : "black";

        Boards.update(gameId, {
            $set: {
                dots: dots,
                whiteIsNext: !board.whiteIsNext,
                last: row + '-' + col
            },
        });

        const winner = checkWinner(dots, board.size);
        let winnerId = null;
        if (winner) {
            if (winner === "white") {
                winnerId = board.creatorIsWhite === true;
            } else {
                winnerId = board.creatorIsWhite === false;
            }
            Boards.update(gameId, {
                $set: {
                    end: true,
                    winnerIsAuthor: winnerId,
                    draw: false
                },
            });
        }
    },
});

function dotsGeneration(size) {
    let dots = [];
    let rows = 0;
    let id = 0;

    for(rows; rows < size; rows++) {
        let cols = 0;
        let dotsRow = [];
        for (cols; cols < size; cols++) {
            dotsRow.push({id: id++, state: null});
        }
        dots.push(dotsRow);
    }
    return dots;
}

function checkWinner(dots, size) {
    let rows = 0;
    // let size = this.props.boards[0].size;

    // console.log(this.props.boards[0]);

    for(rows; rows < size; rows++) {
        let cols = 0;
        for (cols; cols < size; cols++) {
            let val = dots[rows][cols].state;
            if (val !== null) {
                /* 5 horizontal */
                if (dots[rows][cols + 4] !== undefined &&
                    dots[rows][cols + 1].state === val &&
                    dots[rows][cols + 2].state === val &&
                    dots[rows][cols + 3].state === val &&
                    dots[rows][cols + 4].state === val) {
                    return val;
                }
                /* 5 vertical */
                if (dots[rows + 4] !== undefined &&
                    dots[rows + 1][cols].state === val &&
                    dots[rows + 2][cols].state === val &&
                    dots[rows + 3][cols].state === val &&
                    dots[rows + 4][cols].state === val) {
                    return val;
                }

                /* 5 oblige right */
                if (dots[rows + 4] !== undefined && dots[rows + 4][cols + 4] !== undefined &&
                    dots[rows + 1][cols + 1].state === val &&
                    dots[rows + 2][cols + 2].state === val &&
                    dots[rows + 3][cols + 3].state === val &&
                    dots[rows + 4][cols + 4].state === val) {
                    return val;
                }

                /* 5 oblique left */
                if (dots[rows + 4] !== undefined && dots[rows + 4][cols - 4] !== undefined &&
                    dots[rows + 1][cols - 1].state === val &&
                    dots[rows + 2][cols - 2].state === val &&
                    dots[rows + 3][cols - 3].state === val &&
                    dots[rows + 4][cols - 4].state === val) {
                    return val;
                }
            }
        }
    }
    return false;
}