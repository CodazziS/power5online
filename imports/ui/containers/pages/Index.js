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
        return (
            <div className="index_podium">
                <h2><T>INDEX_PODIUM</T></h2>
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
        return (
            <div className="index_player_stats">
                <h2><T>INDEX_STATS</T></h2>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 winnerTrophy"></div>
                    <div className="comp_game_line_230"> <T>INDEX_STATS_WIN</T></div>
                    <div className="comp_game_line_90 alright">{this.props.winGames}</div>
                </div>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 loserTrophy"></div>
                    <div className="comp_game_line_230"> <T>INDEX_STATS_LOSE</T></div>
                    <div className="comp_game_line_90 alright">{this.props.loseGames}</div>
                </div>
                <div className="comp_game_lines">
                    <div className="comp_game_line_40 drawTrophy"></div>
                    <div className="comp_game_line_230"> <T>INDEX_STATS_DRAW</T></div>
                    <div className="comp_game_line_90 alright">{this.props.drawGames}</div>
                </div>
            </div>
        );
    }
    renderPlayerHistory() {
        const T = i18n.createComponent();
        return (
            <div className="index_player_history">
                <h2>
                    <T>INDEX_PLAYER_HISTORY</T>&nbsp;
                    (<a href="/history"><T>INDEX_PLAYER_HISTORY_SEE_ALL</T></a>)
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
    renderGameWatcher() {
        const T = i18n.createComponent();
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

    render() {
        const T = i18n.createComponent();
        if (this.props.loading) {
            return (<Panel type='warn' text='INDEX_LOADING' />);
        }
        return (
            <div className="container">
                <Header
                    title="APP_TITLE"
                />
                <div className="index_content">
                    <div className="index_top_block">
                        { /*this.renderPodium()*/ }
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

