import React, { Component } from 'react';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { withTracker } from 'meteor/react-meteor-data';
import { Boards } from '../../api/boards.js';
import { Meteor } from 'meteor/meteor';

import Board from './parts/Board.js';
import Panel from './components/Panel.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Button from './components/Button.js';

class Visitor extends Component {

    constructor(props) {
        super(props);
        this._id = FlowRouter.getParam('_id');
    }

    handleClick() {
        return;
    }

    replayButton() {
        let board = this.props.board;

        if (board.replayId) {
            FlowRouter.go('game.show', {_id: board.replayId});
        }
    }

    render() {
        if (!this.props.board) {
            return (<Panel type='warn' text='GAME_LOADING' />);
        }
        if (!this.props.board.authorId) {
            return (
                <Panel type='error' text='THIS_GAME_IS_PRIVATE' />
            );
        }

        const current = this.props.board;
        let replayButton = '';

        document.title = current.game;
        if (current.replayId) {
            replayButton = <Button text="BUTTON_REPLAY_VISITOR" onClick={(current) => this.replayButton(current)}/>;
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
                                { replayButton }
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
                <Footer />
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('gameVisitor', localStorage.getItem('guest_id'), FlowRouter.getParam('_id'));
    Meteor.subscribe('gameAuthorization', localStorage.getItem('guest_id'), FlowRouter.getParam('_id'));

    return {
        board: Boards.findOne(),
    };
})(Visitor);
