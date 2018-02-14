import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Boards } from '../../api/boards.js';

import LaunchedGame from './parts/LaunchedGame.js';
import LastGame from './parts/LastGame.js';
import Header from './components/Header.js';

class App extends Component {

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

    getLaunchedGames() {
        if (typeof this.props.launchGames !== 'undefined' && this.props.launchGames.length > 0 ) {
            return this.props.launchGames;
        } else {
            return [];
        }
    }

    renderLaunchedGames() {
        return this.getLaunchedGames().map((game) => (
            <LaunchedGame
                key={game._id}
                game={game}
                onClick={this.goToGame}
            />
        ));
    }

    getLastGames() {
        if (typeof this.props.lastGames !== 'undefined' && this.props.lastGames.length > 0 ) {
            return this.props.lastGames;
        } else {
            return [];
        }
    }

    renderLastGames() {
        return this.getLastGames().map((game) => (
            <LastGame
                key={game._id}
                game={game}
                onClick={this.goToGame}
            />
        ));
    }

    goToGame() {
        if (this.props.game._id !== null) {
            FlowRouter.go('game.show', {_id: this.props.game._id});
        }
    }

    render() {
        const T = i18n.createComponent();
        return (
            <div className="container">
                <Header
                    title="APP_TITLE"
                />
                <div className="content">
                    <div id="newGameBlock">
                        <h2><T>CREATE_NEW_GAME</T></h2><br />
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                            <strong><T>NEW_GAME_NAME</T></strong>
                            <input
                                type="text"
                                ref="gameName"
                                defaultValue=""
                                placeholder={i18n.__('NEW_GAME_NAME')}
                            /><br />
                            <strong><T>NEW_GAME_SIZE</T></strong>
                            <input
                                type="number"
                                min="6"
                                max="30"
                                ref="gameSize"
                                defaultValue="19"
                                placeholder={i18n.__('NEW_GAME_SIZE')}
                            /><br />
                            <strong><T>NEW_GAME_INVITATION</T></strong>
                            <input
                                type="text"
                                ref="gameOpponent"
                                placeholder={i18n.__('NEW_GAME_INVITATION_USERNAME')}
                            /><br />
                            <input type="submit" value={i18n.__('NEW_GAME_SUBMIT')}/>
                        </form>
                    </div>
                    <div id="gamesStats">
                        <h2><T>STATS_TITLE</T></h2><br />
                        <table>
                            <tbody>
                            <tr><th>&#x1F3C6; <T>GAMES_WIN</T> : </th><td>{this.props.winGames}</td></tr>
                            <tr><th>&#x0274C; <T>GAMES_LOSE</T> : </th><td>{this.props.loseGames}</td></tr>
                            <tr><th>&#x1F3F3; &nbsp;&nbsp;<T>GAMES_DRAW</T> : </th><td>{this.props.drawGames}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="gamesLaunched">
                        <h2><T>STATS_LAUNCHED</T></h2><br />
                        <table>
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th><T>OPPONENT</T></th>
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderLaunchedGames()}
                            </tbody>
                        </table>
                    </div>
                    <div id="lastGames">
                        <h2><T>GAMES_LASTS</T></h2><br />
                        <table>
                            <tbody>
                            {this.renderLastGames()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('myGames', localStorage.getItem('guest_id'));
    let userId = localStorage.getItem('guest_id');
    if (Meteor.user()) {
        userId = Meteor.user()._id;
    }
    return {
        launchGames: Boards.find(
            {
                $and: [
                    {end: false},
                    {$or: [
                        {authorId: userId},
                        {opponentId: userId}
                    ]}
            ]},
            {sort:{lastActionAt: -1, createdAt: -1}}
            ).fetch(),

        lastGames: Boards.find(
            {
                $and: [
                    {end: true},
                    {$or: [
                        {authorId: userId},
                        {opponentId: userId}
                    ]}
            ]},
            {sort:{lastActionAt: -1, createdAt: -1}, limit: 10}
            ).fetch(),

        winGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                    {$and: [{authorId: userId}, {winnerIsAuthor: true}]},
                    {$and: [{opponentId: userId}, {winnerIsAuthor: false}]}
                ]}
            ]}).count(),

        loseGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: userId}, {winnerIsAuthor: false}]},
                        {$and: [{opponentId: userId}, {winnerIsAuthor: true}]}
                    ]}
            ]}).count(),

        drawGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: userId}, {draw: true}]},
                        {$and: [{opponentId: userId}, {draw: true}]}
                    ]}
            ]}).count(),
    };
})(App);