import {Meteor} from 'meteor/meteor';
import {Boards} from '../../imports/api/boards.js';
import {Options} from '../../imports/api/options.js';
import {Migrations} from 'meteor/percolate:migrations';


export default class Statistics {

    constructor() {

    }

    calc(checkAllUsers) {
        let users;
        let i;
        let podium = {
            week: {
                best:{val: null, user: null},
                max:{val: null, user: null},
                loser:{val: null, user: null},
            },
            month: {
                best:{val: null, user: null},
                max:{val: null, user: null},
                loser:{val: null, user: null},
            },
            lastCalculation: new Date()
        };

        if (checkAllUsers) {
            users = Meteor.users.find().fetch();
        } else {
            users = Meteor.users.find({
                'lastActiveDate': {
                    $gte: new Date((new Date().getTime()) - 1000 * 60 * 60)
                }
            }).fetch();
        }

        for (i in users) {
            if (users.hasOwnProperty(i)) {
                let accountStats = this._getAccountStats(users[i]);
                let lastMonthStats = this._getLastMonthStats(users[i]);
                let lastWeekStats = this._getLastWeekStats(users[i]);
                let weekStats = this._getWeekStats(users[i]);

                if (checkAllUsers) {
                    if (podium.week.best.val === null || podium.week.best.val < lastWeekStats.score) {
                        podium.week.best.val = lastWeekStats.score;
                        podium.week.best.user = users[i].power5Username;
                    }
                    if (podium.week.max.val === null || podium.week.max.val < lastWeekStats.total) {
                        podium.week.max.val = lastWeekStats.total;
                        podium.week.max.user = users[i].power5Username;
                    }
                    if (podium.week.loser.val === null || podium.week.loser.val < lastWeekStats.lose) {
                        podium.week.loser.val = lastWeekStats.lose;
                        podium.week.loser.user = users[i].power5Username;
                    }
                    if (podium.month.best.val === null || podium.month.best.val < lastMonthStats.score) {
                        podium.month.best.val = lastMonthStats.score;
                        podium.month.best.user = users[i].power5Username;
                    }
                    if (podium.month.max.val === null || podium.month.max.val < lastMonthStats.total) {
                        podium.month.max.val = lastMonthStats.total;
                        podium.month.max.user = users[i].power5Username;
                    }
                    if (podium.month.loser.val === null || podium.month.loser.val < lastMonthStats.lose) {
                        podium.month.loser.val = lastMonthStats.lose;
                        podium.month.loser.user = users[i].power5Username;
                    }
                }

                Meteor.users.update(users[i]._id, {
                    $set: {
                        power5Stats: {
                            total: accountStats,
                            lastMonth: lastMonthStats,
                            lastWeek: lastWeekStats,
                            week: weekStats,
                        }
                    },
                });
            }
        }
        if (checkAllUsers) {
            let podiumDb = Options.find({name: 'podium'}).fetch();
            if (podiumDb[0]) {
                Options.update(podiumDb[0]._id, {$set: {value: podium}});
            } else {
                Options.insert({name: 'podium', value: podium});
            }
        }
    }

    _getAccountStats(user) {
        let boards = Boards.find({
            $and: [
                {$or: [
                        {authorId: user._id},
                        {opponentId: user._id},
                    ]},
                {authorType: 'meteor'},
                {opponentType: 'meteor'},
                {end: true},
            ]}).fetch();
        return this._calcStats(user, boards);
    }

    _getLastMonthStats(user) {
        let date = new Date();
        let firstDayOfLastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

        let boards = Boards.find({
            $and: [
                {$or: [
                        {authorId: user._id},
                        {opponentId: user._id},
                    ]},
                {authorType: "meteor"},
                {opponentType: "meteor"},
                {end: true},
                {lastActionAt: {
                    $gte: firstDayOfLastMonth
                }},
            ]}).fetch();
        return this._calcStats(user, boards);
    }

    _getLastWeekStats(user) {
        let date = new Date();
        let firstDayOfLastWeek = new Date(date.setDate(date.getDate() - date.getDay() - 7 + (date.getDay() === 0 ? -6:1)));

        let boards = Boards.find({
            $and: [
                {$or: [
                        {authorId: user._id},
                        {opponentId: user._id},
                    ]},
                {authorType: "meteor"},
                {opponentType: "meteor"},
                {end: true},
                {lastActionAt: {
                        $gte: firstDayOfLastWeek
                    }},
            ]}).fetch();
        return this._calcStats(user, boards);
    }

    _getWeekStats(user) {
        let date = new Date();
        let firstDayOfLastWeek = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6:1)));

        let boards = Boards.find({
            $and: [
                {$or: [
                        {authorId: user._id},
                        {opponentId: user._id},
                    ]},
                {authorType: "meteor"},
                {opponentType: "meteor"},
                {end: true},
                {lastActionAt: {
                        $gte: firstDayOfLastWeek
                    }},
            ]}).fetch();
        return this._calcStats(user, boards);
    }

    _calcStats(user, boards) {
        let stats = {win: 0, lose: 0, draw: 0, score: 0, total: 0};

        for (let i in boards) {
            if (boards.hasOwnProperty(i)) {
                let board = boards[i];

                if (board.draw) {
                    stats.draw++;
                    stats.score++;
                } else if (board.authorId === user._id && board.winnerIsAuthor || board.opponentId === user._id && !board.winnerIsAuthor) {
                    stats.win++;
                    stats.score += 2;
                } else if (board.authorId === user._id && !board.winnerIsAuthor || board.opponentId === user._id && board.winnerIsAuthor) {
                    stats.lose++;
                    stats.score -= 2;
                } else {
                    throw new Meteor.Error('bad-tasks');
                }
                stats.total++;
            }
        }
        return stats;
    }
}