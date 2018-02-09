import React, { Component } from 'react';

import Board from './parts/Board.js';
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../AccountsUIWrapper.js';

import { Boards } from '../../api/boards.js';
import {Meteor} from "meteor/meteor";
import {check} from "meteor/check";

class Game extends Component {

    constructor(props) {
        super(props);
        this.loaded = false;
        this._id = FlowRouter.getParam('_id');
        this.allowed = false;
    }

    loadBoard() {
        return (this.props.boards && this.props.boards[0]);
    }

    handleClick(rowcol) {
        Meteor.call('boards.addDot', this.props.boards[0]._id, rowcol[0], rowcol[1], localStorage.getItem('guest_id'));
    }

    getPlayerType() {
        const current = this.props.boards[0];

        let user_id = null;

        if (Meteor.user()) {
            user_id = Meteor.user()._id;
        } else {
            user_id = localStorage.getItem('guest_id');
        }

        if ((current.authorType === 'guest' && current.authorId === localStorage.getItem('guest_id')) ||
            (current.authorType === 'meteor' && current.authorId === user_id)) {
            return 1;
        }
        if ((current.opponentType === 'guest' && current.opponentId === localStorage.getItem('guest_id')) ||
            (current.opponentType === 'meteor' && current.opponentId === user_id)) {
            return 2;
        }
        return null;
    }

    isPlayerAllowed() {
        if (this.allowed) {
            return true;
        }
        if (this.getPlayerType() !== null) {
            this.allowed = true;
            return true;
        }

        const current = this.props.boards[0];
        if (current.opponentType === null) {
            Meteor.call('boards.setOpponent', this.props.boards[0]._id, localStorage.getItem('guest_id'), function(error, result) {
                if (error) {
                    alert('Vous ne pouvez pas rejoindre la partie');
                } else {
                    this.allowed = true;
                }
            });
        }

        return this.allowed;
    }

    changeFavicon(src) {
        document.head.removeChild(document.getElementById('favicon'));
        document.head.removeChild(document.getElementById('faviconpng'));
        let link = document.createElement('link');
        let linkpng = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
        link.href = src + '.ico';
        linkpng.id = 'faviconpng';
        linkpng.rel = 'icon';
        linkpng.href = src + '.png';
        document.head.appendChild(link);
        document.head.appendChild(linkpng);
    }

    replay() {
        Meteor.call('boards.replay', this.props.boards[0]._id, localStorage.getItem('guest_id'));
    }

    checkReplay(board) {
        let user_id = null;
        let guest = localStorage.getItem('guest_id');

        if (board.replay_id) {
            if (Meteor.user()) {
                user_id = Meteor.user()._id;
            } else {
                check(guest, String);
                user_id = guest;
            }

            if ((board.authorReplay && (board.authorId === guest || board.authorId === user_id)) ||
                (board.opponentReplay && (board.opponentId === guest || board.opponentId === user_id))){
                Meteor.call('boards.replayAccepted', this.props.boards[0]._id, localStorage.getItem('guest_id'));
                FlowRouter.go('game.show', {_id: board.replay_id});
            }
        }
    }

    render() {
        if (!this.loaded) {
            if (!this.loadBoard()) {
                return (
                    <h1>Chargement du plateau ...</h1>
                );
            }
        }
        if (!this.isPlayerAllowed()) {
            return (
                <h1>Ce jeu est complet ...</h1>
            );
        }

        const current = this.props.boards[0];

        if (!current.end) {
            this.changeFavicon((current.whiteIsNext ? '/favicon-w' : '/favicon-b'));
        } else {
            this.changeFavicon('/favicon');
            this.checkReplay(current);
        }

        return (
            <div className="container">
                <header>
                    <h1>{current.game}</h1>
                    <AccountsUIWrapper />
                </header>
                <div className="content">
                    <div id="gameScore">
                        <div className="scoreboard">
                            <div className="scoreboardPlayer">
                                <div className={(current.whiteIsNext && !current.end) ? "scoreboardPlayerActive" : "scoreboardPlayerNotActive"}>
                                    <div className="scoreboardPlayerWhite"></div>
                                </div>
                                <div className="scoreboardPlayerName">
                                    <span className={(current.end && ((current.winnerIsAuthor && current.creatorIsWhite) || (!current.winnerIsAuthor && !current.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                                    {(current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}
                                </div>
                            </div>

                            <hr className="scoreboardSeparator"></hr>
                            <span className="scoreboardSeparatorText">{" VS "}</span>
                            <hr className="scoreboardSeparator"></hr>

                            <div className="scoreboardPlayer">
                                <div className={(!current.whiteIsNext && !current.end)? "scoreboardPlayerActive" : "scoreboardPlayerNotActive"}>
                                    <div className="scoreboardPlayerBlack"></div>
                                </div>
                                <div className="scoreboardPlayerName">
                                    <span className={(current.end && ((current.winnerIsAuthor && !current.creatorIsWhite) || (!current.winnerIsAuthor && current.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                                    {(!current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}
                                    </div>
                            </div>
                            <button onClick={function(){document.location.href="/"}}>Accueil</button>
                            <button onClick={current => this.replay(current)}>Rejouer</button>

                        </div>
                    </div>
                    <div id="gameBoard" className="game-board">
                        <Board
                            dots={current.dots}
                            size={current.size}
                            last={current.last}
                            onClick={i => this.handleClick(i)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('boards', localStorage.getItem('guest_id'));
    return {
        boards: Boards.find({_id: FlowRouter.getParam('_id')}).fetch(),
    };
})(Game);