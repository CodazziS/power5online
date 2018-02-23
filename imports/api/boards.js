import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Boards = new Mongo.Collection('boards');

if (Meteor.isServer) {
    Meteor.publish('myGames', function (guestId) {
        return Boards.find({
            $or: [
                {authorId: this.userId},
                {opponentId: this.userId},
                {authorId: guestId},
                {opponentId: guestId},
                {opponentId: null},
            ]});
    });
    Meteor.publish('myGamesLite', function (guestId) {
        return Boards.find({
            $or: [
                {authorId: this.userId},
                {opponentId: this.userId},
                {authorId: guestId},
                {opponentId: guestId},
                {opponentId: null},
            ]},
            {fields: {dots: 0, stepHistory: 0}}
        );
    });
    Meteor.publish('publicGame', function () {
        return Boards.find({
            $or: [
                {private: false}
            ]}
       );
    });
    Meteor.publish('publicGameLite', function () {
        return Boards.find({
            $or: [
                {private: false}
            ]},
            {fields: {dots: 0, stepHistory: 0}}
        );
    });
    Meteor.publish('gameAuthorization', function (gameId) {
        return Boards.find(
            {_id: gameId},
            {
                fields: {_id: 1, private: 1}
            }
        );
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
        userName = Meteor.user().power5Username;
        userType = 'meteor';
    } else {
        check(guestId, String);
        userId = guestId;
        userName = 'guest_' + userId;
        userType = 'guest';
    }
    return {userId, userName, userType};
}

function checkUserEditAction(game, guestId) {
    const user = getCurrentUser(guestId);
    if (game.authorId === user.userId || game.opponentId === user.userId || game.opponentId === null) {
        return;
    }
    throw new Meteor.Error('user-not-allowed');
}

function checkWinner(dots, size) {
    let rows = 0;
    let draw = true;

    for(rows; rows < size; rows++) {
        let cols = 0;
        for (cols; cols < size; cols++) {
            let val = dots[rows][cols].state;
            if (val !== null) {
                /* 5 horizontal */
                if (typeof dots[rows][cols + 4] !== 'undefined' &&
                    dots[rows][cols + 1].state === val &&
                    dots[rows][cols + 2].state === val &&
                    dots[rows][cols + 3].state === val &&
                    dots[rows][cols + 4].state === val) {
                    return {
                        draw: false,
                        winner: val,
                        dots: [[rows, cols], [rows, cols+1], [rows, cols+2], [rows, cols+3], [rows, cols+4]]
                    };
                }
                /* 5 vertical */
                if (typeof dots[rows + 4] !== 'undefined' &&
                    dots[rows + 1][cols].state === val &&
                    dots[rows + 2][cols].state === val &&
                    dots[rows + 3][cols].state === val &&
                    dots[rows + 4][cols].state === val) {
                    return {
                        draw: false,
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols], [rows+2, cols], [rows+3, cols], [rows+4, cols]]
                    };
                }

                /* 5 oblige right */
                if (typeof dots[rows + 4] !== 'undefined' && typeof dots[rows + 4][cols + 4] !== 'undefined' &&
                    dots[rows + 1][cols + 1].state === val &&
                    dots[rows + 2][cols + 2].state === val &&
                    dots[rows + 3][cols + 3].state === val &&
                    dots[rows + 4][cols + 4].state === val) {
                    return {
                        draw: false,
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols+1], [rows+2, cols+2], [rows+3, cols+3], [rows+4, cols+4]]
                    };
                }

                /* 5 oblique left */
                if (typeof dots[rows + 4] !== 'undefined' && typeof dots[rows + 4][cols - 4] !== 'undefined' &&
                    dots[rows + 1][cols - 1].state === val &&
                    dots[rows + 2][cols - 2].state === val &&
                    dots[rows + 3][cols - 3].state === val &&
                    dots[rows + 4][cols - 4].state === val) {
                    return {
                        draw: false,
                        winner: val,
                        dots: [[rows, cols], [rows+1, cols-1], [rows+2, cols-2], [rows+3, cols-3], [rows+4, cols-4]]
                    };
                }
            } else {
                draw = false;
            }
        }
    }
    if (draw) {
        return {
            draw,
            winner: null,
            dots: null
        };
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
            let opponent = Meteor.users.findOne({$text: {$search: game.opponent, $caseSensitive :false}});

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
            stepHistory: [],
            whiteIsNext: true,
            creatorIsWhite: (Math.floor(Math.random() * Math.floor(2)) === 1),
            authorType: currentUser.userType,
            authorId: currentUser.userId,
            authorUsername: currentUser.userName,
            opponentType,
            opponentId,
            opponentUsername,
            createdAt: new Date(),
            end: false,
            winnerIsAuthor: false,
            draw: false,
            replayId: null,
            lastActionAt: null,
            private: true,
            //actions
            askReplay: null,
            askNull: null,
            step: 0
        });
    },

    'boards.setOpponent'(gameId, guest) {
        const currentUser = getCurrentUser(guest);
        const board = Boards.findOne(gameId);

        check(gameId, String);
        checkUserEditAction(board, guest);

        Boards.update(gameId, {
            $set: {
                opponentType: currentUser.userType,
                opponentId: currentUser.userId,
                opponentUsername: currentUser.userName,
                lastActionAt: null
            },
        });
    },

    'boards.switchPrivacy'(gameId, guest, privateGame) {
        const board = Boards.findOne(gameId);

        check(gameId, String);
        checkUserEditAction(board, guest);

        Boards.update(gameId, {
            $set: {
                private: privateGame
            },
        });
    },

    'boards.cancel'(gameId, guest) {
        const board = Boards.findOne(gameId);

        check(gameId, String);
        checkUserEditAction(board, guest);

        Boards.remove(gameId);
    },

    'boards.win'(gameId, guest) {
        const board = Boards.findOne(gameId);
        const currentUser = getCurrentUser(guest);
        let winnerIsAuthor = false;

        check(gameId, String);
        checkUserEditAction(board, guest);

        if (currentUser.userId === board.authorId) {
            winnerIsAuthor = true;
        }

        if (board.lastActionAt.getTime() < ((new Date()).getTime() - 1000 * 3600 * 24)) {
            if ((winnerIsAuthor && (!board.whiteIsNext && board.creatorIsWhite) || (board.whiteIsNext && !board.creatorIsWhite)) ||
                (!winnerIsAuthor && (board.whiteIsNext && board.creatorIsWhite) || (!board.whiteIsNext && !board.creatorIsWhite))) {
                Boards.update(gameId, {
                    $set: {
                        end: true,
                        winnerIsAuthor,
                        draw: false
                    },
                });
                return;
            }
        }
        throw new Meteor.Error('action-not-permited');
    },

    'boards.abord'(gameId, guest) {
        const board = Boards.findOne(gameId);
        const currentUser = getCurrentUser(guest);

        check(gameId, String);
        checkUserEditAction(board, guest);

        if (currentUser.userId === board.authorId) {
            Boards.update(gameId, {
                $set: {
                    end: true,
                    winnerIsAuthor: false,
                    draw: false
                },
            });
        } else if (currentUser.userId === board.opponentId) {
            Boards.update(gameId, {
                $set: {
                    end: true,
                    winnerIsAuthor: true,
                    draw: false
                },
            });
        }
    },

    'boards.replay'(gameId, guest) {
        const board = Boards.findOne(gameId);
        const currentUser = getCurrentUser(guest);

        checkUserEditAction(board, guest);

        if (!board.end) {
            return;
        }

        if (!board.askReplay) {
            Boards.update(gameId, {
                $set: {
                    askReplay: currentUser.userId,
                },
            });
        } else if (board.askReplay !== currentUser.userId) {
            const newId = Boards.insert({
                size: board.size,
                game: board.game,
                dots: dotsGeneration(board.size),
                stepHistory: [],
                whiteIsNext: true,
                creatorIsWhite: !board.creatorIsWhite,
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
                replayId: null,
                private: board.private,
                step: 0
            });
            Boards.update(gameId, {
                $set: {
                    replayId: newId,
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
        let step = board.step;
        let stepHistory = board.stepHistory;

        check(gameId, String);
        checkUserEditAction(board, guest);

        if (!board.opponentId || dots[row][col].state || board.end) {
            return;
        }
        if ((board.whiteIsNext && !(whitePlayer === currentUser.userId || whitePlayer === guest)) ||
            (!board.whiteIsNext && !(blackPlayer === currentUser.userId || blackPlayer === guest))) {
            return;
        }

        dots[row][col].state = board.whiteIsNext ? 'white' : 'black';
        stepHistory.push({row, col, state: board.whiteIsNext ? 'white' : 'black'});
        Boards.update(gameId, {
            $set: {
                dots,
                stepHistory,
                whiteIsNext: !board.whiteIsNext,
                last: row + '-' + col,
                lastActionAt: new Date(),
                step: step++
            },
        });

        const checkWin = checkWinner(dots, board.size);
        if (checkWin) {
            let winnerIsAuthor = null;
            if (!checkWin.draw) {
                let winner = checkWin.winner;
                let winDots = checkWin.dots;
                winnerIsAuthor = (winner === 'white') ? (board.creatorIsWhite === true) : (board.creatorIsWhite === false);
                dots[winDots[0][0]][winDots[0][1]].win = true;
                dots[winDots[1][0]][winDots[1][1]].win = true;
                dots[winDots[2][0]][winDots[2][1]].win = true;
                dots[winDots[3][0]][winDots[3][1]].win = true;
                dots[winDots[4][0]][winDots[4][1]].win = true;
            }
            Boards.update(gameId, {
                $set: {
                    dots,
                    end: true,
                    winnerIsAuthor,
                    draw: checkWin.draw
                },
            });
        }
    },
});

