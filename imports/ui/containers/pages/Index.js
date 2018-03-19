import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import GamesLines from '../components/GamesLines.js';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Panel from '../components/Panel.js';

export default class Index extends Component {

    handleSubmit(event) {
        event.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.gameName).value.trim();
        const size = ReactDOM.findDOMNode(this.refs.gameSize).value.trim();
        const opponent = ReactDOM.findDOMNode(this.refs.gameOpponent).value.trim();

        const game = {
            size: parseInt(size),
            game: name,
            guestId: localStorage.getItem('guest_id'),
            opponent
        };

        Meteor.call('boards.insert', game, function(error, result) {
            if (error) {
                alert(error);
            } else {
                FlowRouter.go('game.show', {_id: result});
            }
        });
    }

    goToGame(gameId) {
        if (gameId !== null) {
            FlowRouter.go('game.show', {_id: gameId});
        }
    }

    goToGameVisitor(gameId) {
        if (gameId !== null) {
            FlowRouter.go('game.spec', {_id: gameId});
        }
    }

    renderPodium() {
        const T = i18n.createComponent();
        let podium = this.props.podium.value;

        return (
            <div className="index_podium">
                <h2><T>INDEX_PODIUM</T></h2>

                <div className="comp_game_lines">
                    <div className="comp_game_line_40"></div>
                    <div className="comp_game_line_160"><strong><T>INDEX_PODIUM_LAST_WEEK</T></strong></div>
                    <div className="comp_game_line_160"><strong><T>INDEX_PODIUM_LAST_MONTH</T></strong></div>
                </div>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 tooltip tooltipleft winnerTrophy">
                        <span className="tooltip_text"><T>INDEX_PODIUM_BEST</T></span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.week.best.user}</span>
                        <span className="index_podium_value"> ({podium.week.best.val}<T>INDEX_PODIUM_PTS</T>)</span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.month.best.user}</span>
                        <span className="index_podium_value"> ({podium.month.best.val}<T>INDEX_PODIUM_PTS</T>)</span>
                    </div>
                </div>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 tooltip tooltipleft totalTrophy">
                        <span className="tooltip_text"><T>INDEX_PODIUM_MAX</T></span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.week.max.user}</span>
                        <span className="index_podium_value"> ({podium.week.max.val})</span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.month.max.user}</span>
                        <span className="index_podium_value"> ({podium.month.max.val})</span>
                    </div>
                </div>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 tooltip tooltipleft loserTrophy">
                        <span className="tooltip_text"><T>INDEX_PODIUM_LOSER</T></span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.week.loser.user}</span>
                        <span className="index_podium_value"> ({podium.week.loser.val})</span>
                    </div>
                    <div className="comp_game_line_160">
                        <span className="index_podium_username">{podium.month.loser.user}</span>
                        <span className="index_podium_value"> ({podium.month.loser.val})</span>
                    </div>
                </div>
            </div>
        );
    }
    renderGameCreation() {
        const T = i18n.createComponent();
        return (
            <div className="index_game_creation">
                <h2><T>INDEX_GAME_CREATION</T></h2>
                <form onSubmit={this.handleSubmit.bind(this)} >
                    <strong><T>INDEX_GAME_CREATION_NAME</T></strong>
                    <input
                        type="text"
                        ref="gameName"
                        defaultValue={i18n.__('INDEX_GAME_CREATION_NAME_VALUE')}
                        placeholder={i18n.__('INDEX_GAME_CREATION_NAME')}
                    /><br />
                    <strong><T>INDEX_GAME_CREATION_SIZE</T></strong>
                    <input
                        type="number"
                        min="6"
                        max="30"
                        ref="gameSize"
                        defaultValue="19"
                        placeholder={i18n.__('INDEX_GAME_CREATION_SIZE')}
                    /><br />
                    <strong><T>INDEX_GAME_CREATION_OPPONENT</T></strong>
                    <input
                        type="text"
                        ref="gameOpponent"
                        placeholder={i18n.__('INDEX_GAME_CREATION_OPPONENT_NAME')}
                    /><br />
                    <input type="submit" value={i18n.__('INDEX_GAME_CREATION_SUBMIT')}/>
                </form>
            </div>
        );
    }
    renderGameLaunched() {
        const T = i18n.createComponent();

        return (
            <div className="index_game_launched">
                <h2><T>INDEX_GAME_LAUNCHED</T></h2>

                <GamesLines
                    games={this.props.launchGames}
                    putMyTurn="125"
                    putMyOpponent="125"
                    putButtonRePlay="110"
                    onClick={this.goToGame}
                />
            </div>
        );
    }
    renderPlayerStats() {
        const T = i18n.createComponent();
        let user = Meteor.user();

        if (Meteor.user() && user.power5Stats && user.power5Stats.week) {
            return (
                <div className="index_player_stats">
                    <h2><T>INDEX_STATS</T></h2>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40"></div>
                        <div className="comp_game_line_80 alright weekIcon"></div>
                        <div className="comp_game_line_80 alright lastWeekIcon"></div>
                        <div className="comp_game_line_80 alright lastMonthIcon"></div>
                        <div className="comp_game_line_80 alright"></div>
                    </div>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40 winnerTrophy"></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.week.win}<span className="tooltip_text"><T>INDEX_STATS_WIN_WEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastWeek.win}<span className="tooltip_text"><T>INDEX_STATS_WIN_LWEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastMonth.win}<span className="tooltip_text"><T>INDEX_STATS_WIN_LMONTH</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.total.win}<span className="tooltip_text"><T>INDEX_STATS_WIN_TOTAL</T></span></div>
                    </div>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40 loserTrophy"></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.week.lose}<span className="tooltip_text"><T>INDEX_STATS_LOSE_WEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastWeek.lose}<span className="tooltip_text"><T>INDEX_STATS_LOSE_LWEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastMonth.lose}<span className="tooltip_text"><T>INDEX_STATS_LOSE_LMONTH</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.total.lose}<span className="tooltip_text"><T>INDEX_STATS_LOSE_TOTAL</T></span></div>
                    </div>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40 drawTrophy"></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.week.draw}<span className="tooltip_text"><T>INDEX_STATS_DRAW_WEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastWeek.draw}<span className="tooltip_text"><T>INDEX_STATS_DRAW_LWEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastMonth.draw}<span className="tooltip_text"><T>INDEX_STATS_DRAW_LMONTH</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.total.draw}<span className="tooltip_text"><T>INDEX_STATS_DRAW_TOTAL</T></span></div>
                    </div>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40 totalTrophy"></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.week.total}<span className="tooltip_text"><T>INDEX_STATS_TOTAL_WEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastWeek.total}<span className="tooltip_text"><T>INDEX_STATS_TOTAL_LWEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastMonth.total}<span className="tooltip_text"><T>INDEX_STATS_TOTAL_LMONTH</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.total.total}<span className="tooltip_text"><T>INDEX_STATS_TOTAL_TOTAL</T></span></div>
                    </div>
                    <div className="comp_game_lines">
                        <div className="comp_game_line_40 scoreTrophy"></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.week.score}<span className="tooltip_text"><T>INDEX_STATS_SCORE_WEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastWeek.score}<span className="tooltip_text"><T>INDEX_STATS_SCORE_LWEEK</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.lastMonth.score}<span className="tooltip_text"><T>INDEX_STATS_SCORE_LMONTH</T></span></div>
                        <div className="comp_game_line_80 alright tooltip">{user.power5Stats.total.score}<span className="tooltip_text"><T>INDEX_STATS_SCORE_TOTAL</T></span></div>
                    </div>
                </div>
            );
        }
        return (
            <div className="index_player_stats">
                <h2><T>INDEX_STATS</T></h2>
                <T>INDEX_STATS_NO_GUEST</T>
            </div>
        );

    }
    renderPlayerHistory() {
        const T = i18n.createComponent();
        return (
            <div className="index_player_history">
                <h2>
                    <T>INDEX_PLAYER_HISTORY</T>&nbsp;
                    (<a className="lightlink" href="/history"><T>INDEX_PLAYER_HISTORY_SEE_ALL</T></a>)
                </h2>

                <GamesLines
                    games={this.props.lastGames}
                    putMyScore="40"
                    putMyOpponent="210"
                    putButtonVisitor="110"
                    onClick={this.goToGameVisitor}
                />
            </div>
        );
    }
    renderGameFinder() {
        const T = i18n.createComponent();

        if (this.props.findGame.length > 0) {
            return (
                <div className="index_game_finder">
                    <h2><T>INDEX_GAME_FINDER</T></h2>
                    <GamesLines
                        games={this.props.findGame}
                        putAuthor="250"
                        putButtonRePlay="110"
                        onClick={this.goToGame}
                    />
                </div>
            );
        }
        return (
            <div className="index_game_finder">
                <h2><T>INDEX_GAME_FINDER</T></h2>
                <div><T>INDEX_GAME_FINDER_NO_GAME</T></div>
            </div>
        );
    }
    renderGameWatcher() {
        const T = i18n.createComponent();
        if (this.props.watchGame.length > 0) {
            return (
                <div className="index_game_watcher">
                    <h2><T>INDEX_GAME_WATCHER</T></h2>

                    <GamesLines
                        games={this.props.watchGame}
                        putAuthor="125"
                        putOpponent="125"
                        putButtonVisitor="110"
                        onClick={this.goToGameVisitor}
                    />
                </div>
            );
        }
        return (
            <div className="index_game_watcher">
                <h2><T>INDEX_GAME_WATCHER</T></h2>
                <div><T>INDEX_GAME_FINDER_NO_GAME</T></div>
            </div>
        );
    }

    render() {
        const T = i18n.createComponent();

        if (this.props.loading) {
            return (<Panel type='warn' text='INDEX_LOADING' />);
        }
        if (Meteor.user() && this.props.user.power5Username === undefined) {
            Meteor.call('users.setDefaultUsername');
        }
        return (
            <div className="container">
                <Header
                    title="APP_TITLE"
                />
                <div className="index_content">
                    <div className="index_top_block">
                        { this.renderPodium() }
                    </div>
                    <div className="index_flex_block">
                        { this.renderGameCreation() }
                        { this.renderGameLaunched() }
                    </div>
                    <div className="index_flex_block">
                        { this.renderPlayerStats() }
                        { this.renderPlayerHistory() }
                    </div>
                    <div className="index_flex_block">
                        { this.renderGameFinder() }
                        { this.renderGameWatcher() }
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

