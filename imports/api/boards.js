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

function dotsGeneration(size) {
    let dots = [];
    let rows = 0;
    let id = 0;

    for(rows; rows < size; rows++) {
        let cols = 0;
        let dotsRow = [];
        for (cols; cols < size; cols++) {
            dotsRow.push({id: id++, state: null, win: false});
        }
        dots.push(dotsRow);
    }
    return dots;
}

function getCurrentUser(guestId) {
    let userId = null;
    let userName = null;
    let userType = null;

    if (Meteor.user()) {
        userId = Meteor.user()._id;
        userName = Meteor.user().username;
        userType = 'meteor';
    } else {
        check(guestId, String);
        userId = guestId;
        userName = 'guest_' + userId;
        userType = 'guest';
    }
    return {userId: userId, userName: userName, userType: userType};
}

function checkWinner(dots, size) {
    let rows = 0;

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
                    return {
                        winner: val,
                        dots: [[rows, cols], [rows, cols+1], [rows, cols+2], [rows, cols+3], [rows, cols+4]]
                    };
                }
                /* 5 vertical */
                if (dots[rows + 4] !== undefined &&
                    dots[rows + 1][cols].state === val &&
                    dots[rows + 2][cols].state === val &&
                    dots[rows + 3][cols].state === val &&
                    dots[rows + 4][cols].state === val) {
                    return {
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols], [rows+2, cols], [rows+3, cols], [rows+4, cols]]
                    };
                }

                /* 5 oblige right */
                if (dots[rows + 4] !== undefined && dots[rows + 4][cols + 4] !== undefined &&
                    dots[rows + 1][cols + 1].state === val &&
                    dots[rows + 2][cols + 2].state === val &&
                    dots[rows + 3][cols + 3].state === val &&
                    dots[rows + 4][cols + 4].state === val) {
                    return {
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols+1], [rows+2, cols+2], [rows+3, cols+3], [rows+4, cols+4]]
                    };
                }

                /* 5 oblique left */
                if (dots[rows + 4] !== undefined && dots[rows + 4][cols - 4] !== undefined &&
                    dots[rows + 1][cols - 1].state === val &&
                    dots[rows + 2][cols - 2].state === val &&
                    dots[rows + 3][cols - 3].state === val &&
                    dots[rows + 4][cols - 4].state === val) {
                    return {
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols-1], [rows+2, cols-2], [rows+3, cols-3], [rows+4, cols-4]]
                    };
                }
            }
        }
    }
    return false;
}

Meteor.methods({

    'boards.insert'(game) {
        let opponentType = null;
        let opponentId = null;
        let opponentUsername = null;
        const currentUser = getCurrentUser(game.guestId);

        check(game.size, Number);
        check(game.game, String);

        if (game.size < 6 || game.size > 30) {
            throw new Meteor.Error('bad-size');
        }

        if (game.opponent) {
            let opponentRegex = new RegExp(["^", game.opponent, "$"].join(""), "i");
            let opponent = Meteor.users.findOne({username: { $regex: opponentRegex }});

            if (opponent) {
                opponentType = 'meteor';
                opponentId = opponent._id;
                opponentUsername = opponent.username;
            } else {
                throw new Meteor.Error('player-not-found');
            }
        }

        return Boards.insert({
            size: game.size,
            game: game.game,
            dots: dotsGeneration(game.size),
            whiteIsNext: true,
            creatorIsWhite: (Math.floor(Math.random() * Math.floor(2)) === 1),
            authorType: currentUser.userType,
            authorId: currentUser.userId,
            authorUsername: currentUser.userName,
            authorReplay: false,
            opponentType: opponentType,
            opponentId: opponentId,
            opponentUsername: opponentUsername,
            opponentReplay: false,
            createdAt: new Date(),
            end: false,
            winnerIsAuthor: false,
            draw: false,
            replay_id: null
        });
    },

    'boards.setOpponent'(gameId, guest) {
        const currentUser = getCurrentUser(guest);

        check(gameId, String);
        Boards.update(gameId, {
            $set: {
                opponentType: currentUser.userType,
                opponentId: currentUser.userId,
                opponentUsername: currentUser.userName,
            },
        });
    },

    'boards.replay'(gameId, guest) {
        const board = Boards.findOne(gameId);
        const currentUser = getCurrentUser(guest);

        if (!board.end) {
            return;
        }
        if ((board.authorId === currentUser.userId || board.authorId === guest) &&
            !board.authorReplay && !board.replay_id) {
            board.authorReplay = true;
            Boards.update(gameId, {
                $set: {
                    authorReplay: true,
                },
            });
        }
        if ((board.opponentId === currentUser.userId || board.opponentId === guest) &&
            !board.opponentReplay && !board.replay_id) {
            board.opponentReplay = true;
            Boards.update(gameId, {
                $set: {
                    opponentReplay: true,
                },
            });
        }

        if (board.authorReplay && board.opponentReplay && !board.replay_id) {
            const newId = Boards.insert({
                size: board.size,
                game: board.game,
                dots: dotsGeneration(board.size),
                whiteIsNext: true,
                creatorIsWhite: (Math.floor(Math.random() * Math.floor(2)) === 1),
                authorType: board.authorType,
                authorId: board.authorId,
                authorUsername: board.authorUsername,
                authorReplay: false,
                opponentType: board.opponentType,
                opponentId: board.opponentId,
                opponentUsername: board.opponentUsername,
                opponentReplay: false,
                createdAt: new Date(),
                end: false,
                winnerIsAuthor: false,
                draw: false,
                replay_id: null
            });
            Boards.update(gameId, {
                $set: {
                    replay_id: newId,
                },
            });
        }
    },

    'boards.replayAccepted'(gameId, guest) {
        const board = Boards.findOne(gameId);
        const currentUser = getCurrentUser(guest);

        if ((board.authorId === currentUser.userId || board.authorId === guest) &&
            !board.authorReplay && board.replay_id) {
            Boards.update(gameId, {
                $set: {
                    authorReplay: null,
                },
            });
        }
        if ((board.opponentId === currentUser.userId || board.opponentId === guest) &&
            !board.opponentReplay && board.replay_id) {
            Boards.update(gameId, {
                $set: {
                    opponentReplay: null,
                },
            });
        }
    },

    'boards.addDot'(gameId, row, col, guest) {
        const board = Boards.findOne(gameId);
        const whitePlayer = (board.creatorIsWhite === true) ? board.authorId :  board.opponentId;
        const blackPlayer = (board.creatorIsWhite === false) ? board.authorId :  board.opponentId;
        const currentUser = getCurrentUser(guest);
        let dots = board.dots;

        check(gameId, String);
        if (!board.opponentId || dots[row][col].state || board.end) {
            return;
        }
        if ((board.whiteIsNext && !(whitePlayer === currentUser.userId || whitePlayer === guest)) ||
            (!board.whiteIsNext && !(blackPlayer === currentUser.userId || blackPlayer === guest))) {
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

        const checkWin = checkWinner(dots, board.size);
        if (checkWin) {
            let winner = checkWin.winner;
            let winnerIsAuthor = null;
            let winDots = checkWin.dots;

            winnerIsAuthor = (winner === "white") ? (board.creatorIsWhite === true) : (board.creatorIsWhite === false);
            dots[winDots[0][0]][winDots[0][1]].win = true;
            dots[winDots[1][0]][winDots[1][1]].win = true;
            dots[winDots[2][0]][winDots[2][1]].win = true;
            dots[winDots[3][0]][winDots[3][1]].win = true;
            dots[winDots[4][0]][winDots[4][1]].win = true;

            Boards.update(gameId, {
                $set: {
                    dots: dots,
                    end: true,
                    winnerIsAuthor: winnerIsAuthor,
                    draw: false
                },
            });
        }
    },
});

