import React, { Component } from 'react';

import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import { Boards } from '../../api/boards.js';
import { Meteor } from 'meteor/meteor';

import Board from './parts/Board.js';

class Visitor extends Component {

    constructor(props) {
        super(props);
        this._id = FlowRouter.getParam('_id');
    }

    loadBoard() {
        return (this.props.boards && this.props.boards[0]);
    }

    handleClick() {
        return;
    }

    render() {
        if (!this.loadBoard()) {
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
                                <div className={(!current.whiteIsNext && !current.end)? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
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