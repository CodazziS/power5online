import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import { Boards } from '../../api/boards.js';
import { Meteor } from "meteor/meteor";

import Board from './parts/Board.js';
import ToggleButton from './components/ToggleButton.js';

class Visitor extends Component {

    constructor(props) {
        super(props);
        this.loaded = false;
        this._id = FlowRouter.getParam('_id');
        this.allowed = false;
    }

    loadBoard() {
        return (this.props.boards && this.props.boards[0]);
    }

    getPlayerType() {
        const current = this.props.boards[0];
        let userId = this.getCurrentUser().userId;

        if ((current.authorType === 'guest' && current.authorId === localStorage.getItem('guest_id')) ||
            (current.authorType === 'meteor' && current.authorId === userId)) {
            return 1;
        }
        if ((current.opponentType === 'guest' && current.opponentId === localStorage.getItem('guest_id')) ||
            (current.opponentType === 'meteor' && current.opponentId === userId)) {
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
        let userId = null;
        let guest = localStorage.getItem('guest_id');

        if (board.replayId) {
            if (Meteor.user()) {
                userId = Meteor.user()._id;
            } else {
                userId = guest;
            }

            if ((board.authorReplay && (board.authorId === guest || board.authorId === userId)) ||
                (board.opponentReplay && (board.opponentId === guest || board.opponentId === userId))){
                Meteor.call('boards.replayAccepted', this.props.boards[0]._id, localStorage.getItem('guest_id'));
                FlowRouter.go('game.show', {_id: board.replayId});
            }
        }
    }

    isMyTurn() {
        let userId = this.getCurrentUser().userId;
        const current = this.props.boards[0];

        if (current.end) {
            return false;
        }
        if (current.whiteIsNext && current.creatorIsWhite && userId === current.authorId) {
            return true;
        }
        if (current.whiteIsNext && !current.creatorIsWhite && userId === current.opponentId) {
            return true;
        }
        if (!current.whiteIsNext && current.creatorIsWhite && userId === current.opponentId) {
            return true;
        }
        if (!current.whiteIsNext && !current.creatorIsWhite && userId === current.authorId) {
            return true;
        }
        return false;
    }

    handleClick() {
        return;
    }

    render() {
        if (!this.loaded && !this.loadBoard()) {
            return (
                <h1>Chargement du plateau ...</h1>
            );
        }
        const current = this.props.boards[0];
        document.title = current.game;

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
                                <div className={(current.whiteIsNext && !current.end) ? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
                                    <div className="scoreboardPlayerWhite"></div>
                                </div>
                                <div className="scoreboardPlayerName">
                                    <span className={(current.end && ((current.winnerIsAuthor && current.creatorIsWhite) || (!current.winnerIsAuthor && !current.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                                    {(current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}
                                </div>
                            </div>

                            <hr className="scoreboardSeparator"></hr>
                            <span className="scoreboardSeparatorText">{' VS '}</span>
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
})(Visitor);