import React, { Component } from 'react';

import Board from './parts/Board.js';
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../AccountsUIWrapper.js';

import { Boards } from '../../api/boards.js';
import {Meteor} from "meteor/meteor";

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

    // checkWinner(dots) {
    //     let rows = 0;
    //     let size = this.props.boards[0].size;
    //
    //     // console.log(this.props.boards[0]);
    //
    //     for(rows; rows < size; rows++) {
    //         let cols = 0;
    //         for (cols; cols < size; cols++) {
    //             let val = dots[rows][cols].state;
    //             if (val !== null) {
    //                 /* 5 horizontal */
    //                 if (dots[rows][cols + 4] !== undefined &&
    //                     dots[rows][cols + 1].state === val &&
    //                     dots[rows][cols + 2].state === val &&
    //                     dots[rows][cols + 3].state === val &&
    //                     dots[rows][cols + 4].state === val) {
    //                     return val;
    //                 }
    //                 /* 5 vertical */
    //                 if (dots[rows + 4] !== undefined &&
    //                     dots[rows + 1][cols].state === val &&
    //                     dots[rows + 2][cols].state === val &&
    //                     dots[rows + 3][cols].state === val &&
    //                     dots[rows + 4][cols].state === val) {
    //                     return val;
    //                 }
    //
    //                 /* 5 oblige right */
    //                 if (dots[rows + 4] !== undefined && dots[rows + 4][cols + 4] !== undefined &&
    //                     dots[rows + 1][cols + 1].state === val &&
    //                     dots[rows + 2][cols + 2].state === val &&
    //                     dots[rows + 3][cols + 3].state === val &&
    //                     dots[rows + 4][cols + 4].state === val) {
    //                     return val;
    //                 }
    //
    //                 /* 5 oblique left */
    //                 if (dots[rows + 4] !== undefined && dots[rows + 4][cols - 4] !== undefined &&
    //                     dots[rows + 1][cols - 1].state === val &&
    //                     dots[rows + 2][cols - 2].state === val &&
    //                     dots[rows + 3][cols - 3].state === val &&
    //                     dots[rows + 4][cols - 4].state === val) {
    //                     return val;
    //                 }
    //             }
    //         }
    //     }
    //     return false;
    // }

    handleClick(rowcol) {
        // const board = this.props.boards[0];
        // const dots = board.dots;
        // if (dots[rowcol[0]][rowcol[1]].state || this.checkWinner(dots)) {
        //     return;
        // }

        // if ((board.whiteIsNext && this.getPlayerType() !== 1) ||
        //     (!board.whiteIsNext && this.getPlayerType() !== 2)) {
        //     return;
        // }
        // dots[rowcol[0]][rowcol[1]].state = board.whiteIsNext ? "white" : "black";

        /* UPDATE */
        Meteor.call('boards.addDot', this.props.boards[0]._id, rowcol[0], rowcol[1], localStorage.getItem('guest_id'));
        // Boards.update(this.props.boards[0]._id, {
        //     $set: {
        //         dots: dots,
        //         whiteIsNext: !board.whiteIsNext,
        //         last: rowcol[0] + '-' + rowcol[1]
        //     },
        // });
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
            // let user_id = null;
            // let user_name = null;
            // let user_type = null;
            // if (Meteor.user()) {
            //     user_id = Meteor.user()._id;
            //     user_name = Meteor.user().username;
            //     user_type = 'meteor';
            // } else {
            //     user_id = localStorage.getItem('guest_id');
            //     user_name = 'guest_' + user_id;
            //     user_type = 'guest';
            // }

            Meteor.call('boards.setOpponent', this.props.boards[0]._id, localStorage.getItem('guest_id'), function(error, result) {
                if (error) {
                    alert('Vous ne pouvez pas rejoindre la partie');
                } else {
                    this.allowed = true;
                }
            });
            // Boards.update(this.props.boards[0]._id, {
            //     $set: {
            //         opponentType: user_type,
            //         opponentId: user_id,
            //         opponentUsername: user_name,
            //     },
            // });
        }

        return this.allowed;
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
        // const winner = this.checkWinner(current.dots);
        //
        // let status;
        // if (winner) {
        //     status = "Winner: " + winner;
        // } else {
        //     status = "Next player: " + (current.whiteIsNext ? "White" : "Black");
        // }

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
                                <div className="scoreboardPlayerName">{(current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}</div>
                            </div>

                            <hr className="scoreboardSeparator"></hr>
                            <span className="scoreboardSeparatorText">{" VS "}</span>
                            <hr className="scoreboardSeparator"></hr>

                            <div className="scoreboardPlayer">
                                <div className={(!current.whiteIsNext && !current.end)? "scoreboardPlayerActive" : "scoreboardPlayerNotActive"}>
                                    <div className="scoreboardPlayerBlack"></div>
                                </div>
                                <div className="scoreboardPlayerName">{(!current.creatorIsWhite) ? current.authorUsername : current.opponentUsername}</div>
                            </div>
                            {/*<div className="scoreboardStatus">{status}</div>*/}
                            <button onClick={function(){document.location.href="/"}}>Accueil</button>
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