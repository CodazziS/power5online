import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import LaunchedGame from '../parts/LaunchedGame.js';
import LastGame from '../parts/LastGame.js';
import WatchGame from '../parts/WatchGame.js';
import FindGame from '../parts/FindGame.js';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

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

    renderLaunchedGames() {
        return this.props.launchGames.map((game) => (
            <LaunchedGame
                key={game._id}
                game={game}
                onClick={this.goToGame}
            />
        ));
    }

    renderLastGames() {
        return this.props.lastGames.map((game) => (
            <LastGame
                key={game._id}
                game={game}
                onClick={this.goToGame}
            />
        ));
    }

    renderFindGame() {
        return this.props.findGame.map((game) => (
            <FindGame
                key={game._id}
                game={game}
                onClick={this.goToGame}
            />
        ));
    }

    renderWatchGames() {
        return this.props.watchGame.map((game) => (
            <WatchGame
                key={game._id}
                game={game}
                onClick={this.goToGameVisitor}
            />
        ));
    }

    goToGame() {
        if (this.props.game._id !== null) {
            FlowRouter.go('game.show', {_id: this.props.game._id});
        }
    }

    goToGameVisitor() {
        if (this.props.game._id !== null) {
            FlowRouter.go('game.spec', {_id: this.props.game._id});
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

                    {/************** NEW GAME *************/}
                    <div id="newGameBlock" className="home_box">
                        <h2><T>INDEX_CREATE_NEW_GAME</T></h2><br />
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                            <strong><T>INDEX_NEW_GAME_NAME</T></strong>
                            <input
                                type="text"
                                ref="gameName"
                                defaultValue={i18n.__('INDEX_NEW_GAME_NAME_VALUE')}
                                placeholder={i18n.__('INDEX_NEW_GAME_NAME')}
                            /><br />
                            <strong><T>INDEX_NEW_GAME_SIZE</T></strong>
                            <input
                                type="number"
                                min="6"
                                max="30"
                                ref="gameSize"
                                defaultValue="19"
                                placeholder={i18n.__('INDEX_NEW_GAME_SIZE')}
                            /><br />
                            <strong><T>INDEX_NEW_GAME_INVITATION</T></strong>
                            <input
                                type="text"
                                ref="gameOpponent"
                                placeholder={i18n.__('INDEX_NEW_GAME_INVITATION_USERNAME')}
                            /><br />
                            <input type="submit" value={i18n.__('INDEX_NEW_GAME_SUBMIT')}/>
                        </form>
                    </div>

                    {/*************** GAME STATS ********************/}
                    <div id="gamesStats" className="home_box">
                        <h2><T>INDEX_STATS_TITLE</T></h2><br />

                        <div className="home_box_row">
                            <div className="home_box_col40 winnerTrophy"></div>
                            <div className="home_box_col230"> <T>INDEX_GAMES_WIN</T></div>
                            <div className="home_box_col90 alright">{this.props.winGames}</div>
                        </div>
                        <div className="home_box_row">
                            <div className="home_box_col40 loserTrophy"></div>
                            <div className="home_box_col230"> <T>INDEX_GAMES_LOSE</T></div>
                            <div className="home_box_col90 alright">{this.props.loseGames}</div>
                        </div>
                        <div className="home_box_row">
                            <div className="home_box_col40 drawTrophy"></div>
                            <div className="home_box_col230"> <T>INDEX_GAMES_DRAW</T></div>
                            <div className="home_box_col90 alright">{this.props.drawGames}</div>
                        </div>
                    </div>

                    {/*********** LAUNCHED GAMES ***************/}
                    <div id="gamesLaunched" className="home_box">
                        <h2><T>INDEX_STATS_LAUNCHED</T></h2><br />

                        <div className="home_box_row">
                            <div className="home_box_col125">&nbsp;</div>
                            <div className="home_box_col125"><strong><T>INDEX_OPPONENT</T></strong></div>
                            <div className="home_box_col110">&nbsp;</div>
                        </div>
                        {this.renderLaunchedGames()}
                    </div>

                    {/*********** LASTS GAMES ***************/}
                    <div id="lastGames" className="home_box">
                        <h2><T>INDEX_GAMES_LASTS</T> (<a href="/history"><T>INDEX_SEE_ALL</T></a>)</h2><br />
                        {this.renderLastGames()}
                    </div>

                    {/*********** FIND A GAME ***************/}
                    <div id="findGame" className="home_box">
                        <h2><T>INDEX_FIND_A_GAME</T></h2><br />
                        <div className="home_box_row">
                            <div className="home_box_col250"><strong><T>INDEX_OPPONENT</T></strong></div>
                            <div className="home_box_col110">&nbsp;</div>
                        </div>
                        {this.renderFindGame()}
                    </div>

                    {/*********** WATCH GAME ***************/}
                    <div id="findGame" className="home_box">
                        <h2><T>INDEX_WATCH_A_GAME</T></h2><br />
                        <div className="home_box_row">
                            <div className="home_box_col125"><strong><T>INDEX_PLAYER_ONE</T></strong></div>
                            <div className="home_box_col125"><strong><T>INDEX_PLAYER_TWO</T></strong></div>
                            <div className="home_box_col110">&nbsp;</div>
                        </div>
                        {this.renderWatchGames()}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

