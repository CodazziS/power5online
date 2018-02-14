import React, { Component } from 'react';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { withTracker } from 'meteor/react-meteor-data';
import { Boards } from '../../api/boards.js';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

import Board from './parts/Board.js';
import Header from './components/Header.js';
import Panel from './components/Panel.js';
import ToggleButton from './components/ToggleButton.js';

class Game extends Component {

    constructor(props) {
        super(props);
        this._id = FlowRouter.getParam('_id');
    }

    handleClick(rowcol) {
        Meteor.call('boards.addDot', this.props.board._id, rowcol[0], rowcol[1], localStorage.getItem('guest_id'));
    }

    getCurrentUser(guestId) {
        let userId = null;
        let userName = null;
        let userType = null;

        if (Meteor.user()) {
            userId = Meteor.user()._id;
            userName = Meteor.user().username;
            userType = 'meteor';
        } else {
            userId = guestId;
            userName = 'guest_' + userId;
            userType = 'guest';
        }
        return {userId, userName, userType};
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
        Meteor.call('boards.replay', this.props.board._id, localStorage.getItem('guest_id'));
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
                Meteor.call('boards.replayAccepted', this.props.board._id, localStorage.getItem('guest_id'));
                FlowRouter.go('game.show', {_id: board.replayId});
            }
        }
    }

    isMyTurn() {
        let userId = this.getCurrentUser().userId;
        const current = this.props.board;

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

    switchPrivate() {
        Meteor.call(
            'boards.switchPrivacy',
            this.props.board._id,
            localStorage.getItem('guest_id'),
            !this.props.board.private
        );
    }

    render() {
        const T = i18n.createComponent();
        console.log(this.props);

        if (!this.props.board) {
            return (<Panel type='warn' text='GAME_LOADING' />);
        }
        if (!this.props.board.authorId) {
            if (!this.props.board.private) {
                FlowRouter.go('game.spec', {_id: this.props.board._id});
                return;
            }
            return (
                <Panel type='error' text='GAME_FULL' />
            );
        }

        const current = this.props.board;
        document.title = current.game;

        if (this.isMyTurn()) {
            document.title = i18n.__('MY_ROUND');
        }
        if (!current.end) {
            this.changeFavicon((current.whiteIsNext ? '/favicon-w' : '/favicon-b'));
        } else {
            this.changeFavicon('/favicon');
            this.checkReplay(current);
        }

        return (
            <div className="container">
                <Header
                    title={current.game}
                />
                <div className="content">
                    <div id="gameScore">
                        <div className="scoreboard">
                            <div className="scoreboardPlayer">
                                <div className={(current.whiteIsNext && !current.end) ? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
                                    <div className="scoreboardPlayerWhite"></div>
                                </div>
                                <div className="scoreboardPlayerName">
                                    <span className={(current.end && !current.draw && ((current.winnerIsAuthor && current.creatorIsWhite) || (!current.winnerIsAuthor && !current.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                                    {(current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}
                                </div>
                            </div>

                            <hr className="scoreboardSeparator"></hr>
                            <span className="scoreboardSeparatorText">{' VS '}</span>
                            <hr className="scoreboardSeparator"></hr>

                            <div className="scoreboardPlayer">
                                <div className={(!current.whiteIsNext && !current.end)? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
                                    <div className="scoreboardPlayerBlack"></div>
                                </div>
                                <div className="scoreboardPlayerName">
                                    <span className={(current.end && !current.draw && ((current.winnerIsAuthor && !current.creatorIsWhite) || (!current.winnerIsAuthor && current.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                                    {(!current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}
                                    </div>
                            </div>
                            <ToggleButton
                                check={current.private}
                                onClick={() => this.switchPrivate()}
                            />
                            <span><T>VISITOR_LINK</T></span>
                            <input
                                type="text"
                                className="disableInput"
                                defaultValue={document.location.host + '/visitor/' + current._id}
                                disabled
                            />
                            <button onClick={(current) => this.replay(current)}><T>REPLAY</T></button>

                        </div>
                    </div>
                    <div id="gameBoard" className="game-board">
                        <Board
                            dots={current.dots}
                            size={current.size}
                            last={current.last}
                            onClick={(i) => this.handleClick(i)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('myGames', localStorage.getItem('guest_id'));
    Meteor.subscribe('gameAuthorization', localStorage.getItem('guest_id'), FlowRouter.getParam('_id'));

    return {
        board: Boards.findOne(FlowRouter.getParam('_id'))
    };
})(Game);