import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import { Boards } from '../../api/boards.js';
import LaunchedGame from './parts/LaunchedGame.js';
import LastGame from './parts/LastGame.js';


class App extends Component {

    handleSubmit(event) {
        event.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.gameName).value.trim();
        const size = ReactDOM.findDOMNode(this.refs.gameSize).value.trim();
        const opponent = ReactDOM.findDOMNode(this.refs.gameOpponent).value.trim();

        const game = {
            size: parseInt(size),
            game: name,
            guest_id: localStorage.getItem('guest_id'),
            opponent: opponent
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
        if (this.props.launchGames !== undefined && this.props.launchGames.length > 0 ) {
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
        if (this.props.lastGames !== undefined && this.props.lastGames.length > 0 ) {
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
        console.log(this.props.launchGames);
        return (
            <div className="container">
                <header>
                    <h1>Power5</h1>
                    <AccountsUIWrapper />
                </header>
                <div className="content">
                    <div id="newGameBlock">
                        <h2>Créer une nouvelle partie</h2><br />
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                            <strong>Nom de la partie : </strong>
                            <input
                                type="text"
                                ref="gameName"
                                defaultValue="My game"
                                placeholder="GameName"
                            /><br />
                            <strong>Taille du plateau : </strong>
                            <input
                                type="number"
                                min="6"
                                max="30"
                                ref="gameSize"
                                defaultValue="19"
                                placeholder="Game size"
                            /><br />
                            <strong>Inviter un joueur (optionnel) : </strong>
                            <input
                                type="text"
                                ref="gameOpponent"
                                placeholder="Username"
                            /><br />
                            <input type="submit"/>
                        </form>
                    </div>
                    <div id="gamesStats">
                        <h2>Vos statistiques</h2><br />
                        <table>
                            <tbody>
                            <tr><th>&#x1F3C6; Parties gagnées : </th><td>{this.props.winGames}</td></tr>
                            <tr><th>&#x0274C; Parties perdues : </th><td>{this.props.loseGames}</td></tr>
                            <tr><th>&#x1F3F3; &nbsp;&nbsp;Parties nulles : </th><td>{this.props.drawGames}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="gamesLaunched">
                        <h2>Vos jeux en cours</h2><br />
                        <table>
                            <thead>
                                <tr>
                                    <th>Jeu</th>
                                    <th>Opposant</th>
                                    <th>Reprendre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderLaunchedGames()}
                            </tbody>
                        </table>
                    </div>
                    <div id="lastGames">
                        <h2>Vos jeux passés (10 derniers)</h2><br />
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
    Meteor.subscribe('boards', localStorage.getItem('guest_id'));
    let user_id = localStorage.getItem('guest_id');
    if (Meteor.user()) {
        user_id = Meteor.user()._id;
    }
    return {
        launchGames: Boards.find({end: false}, {sort:{createdAt: -1}}).fetch(),
        lastGames: Boards.find({end: true}, {sort:{createdAt: -1}, limit: 10}).fetch(),
        winGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                    {$and: [{authorId: user_id}, {winnerIsAuthor: true}]},
                    {$and: [{opponentId: user_id}, {winnerIsAuthor: false}]}
                ]}
            ]}).count(),
        loseGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: user_id}, {winnerIsAuthor: false}]},
                        {$and: [{opponentId: user_id}, {winnerIsAuthor: true}]}
                    ]}
            ]}).count(),
        drawGames: Boards.find({
            $and: [
                {end: true},
                {$or: [
                        {$and: [{authorId: user_id}, {draw: true}]},
                        {$and: [{opponentId: user_id}, {draw: true}]}
                    ]}
            ]}).count(),
    };
})(App);