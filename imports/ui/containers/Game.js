import React, { Component } from 'react';

import Board from './parts/Board.js';
import { withTracker } from 'meteor/react-meteor-data';

import { Boards } from '../../api/boards.js';

class Game extends Component {

    constructor(props) {
        super(props);
        this.loaded = false;
        this._id = FlowRouter.getParam('_id');
        this.allowed = false;
        // console.log( this.props.game);
        // this.id = this.props.game[FlowRouter.getParam('_id')].id;
        // this.size = this.props.game[FlowRouter.getParam('_id')].size;
        // this.state = this.props.game[FlowRouter.getParam('_id')].state;
        // console.log(FlowRouter.getParam('_id'));
    }

    loadBoard() {
        return (this.props.boards && this.props.boards[0]);
    }

    checkWinner(dots) {
        let rows = 0;
        let size = this.props.boards[0].size;

        console.log(this.props.boards[0]);

        for(rows; rows < size; rows++) {
            let cols = 0;
            for (cols; cols < size; cols++) {
                let val = dots[rows][cols].state;
                if (val !== null) {
                    /* 5 horizontal */
                    if (dots[rows][cols + 4] !== undefined &&
                        dots[rows][cols + 1].state === val &&
                        dots[rows][cols + 2].state === val &&
                        dots[rows][cols + 3].state === val &&
                        dots[rows][cols + 4].state === val) {
                        return val;
                    }
                    /* 5 vertical */
                    if (dots[rows + 4] !== undefined &&
                        dots[rows + 1][cols].state === val &&
                        dots[rows + 2][cols].state === val &&
                        dots[rows + 3][cols].state === val &&
                        dots[rows + 4][cols].state === val) {
                        return val;
                    }

                    /* 5 oblige right */
                    if (dots[rows + 4] !== undefined && dots[rows + 4][cols + 4] !== undefined &&
                        dots[rows + 1][cols + 1].state === val &&
                        dots[rows + 2][cols + 2].state === val &&
                        dots[rows + 3][cols + 3].state === val &&
                        dots[rows + 4][cols + 4].state === val) {
                        return val;
                    }

                    /* 5 oblique left */
                    if (dots[rows + 4] !== undefined && dots[rows + 4][cols - 4] !== undefined &&
                        dots[rows + 1][cols - 1].state === val &&
                        dots[rows + 2][cols - 2].state === val &&
                        dots[rows + 3][cols - 3].state === val &&
                        dots[rows + 4][cols - 4].state === val) {
                        return val;
                    }
                }
            }
        }

        return false;
    }

    handleClick(rowcol) {
        // const history = this.state.history.slice(0, this.state.stepNumber + 1);
        // const current = history[history.length - 1];
        // const current = history[history.length - 1];
        const board = this.props.boards[0];
        const dots = board.dots;//.slice();

        if (dots[rowcol[0]][rowcol[1]].state || this.checkWinner(dots)) {
            return;
        }

        // console.log(rowcol[0], rowcol[1]);
        // console.log(dots);
        if ((board.whiteIsNext && this.getPlayerType() !== 1) ||
            (!board.whiteIsNext && this.getPlayerType() !== 2)) {
            return;
        }

        dots[rowcol[0]][rowcol[1]].state = board.whiteIsNext ? "white" : "black";
        // let nextState = {
        //     // history: history.concat([
        //     //     {
        //     //         squares: squares
        //     //     }
        //     // ]),
        //     dots: dots,
        //     // stepNumber: history.length,
        //     whiteIsNext: !board.whiteIsNext
        // };
        // this.setState(nextState);

        /* UPDATE */
        // console.log(this.props.game);
        Boards.update(this.props.boards[0]._id, {
            $set: {
                dots: dots,
                whiteIsNext: !board.whiteIsNext,
                last: rowcol[0] + '-' + rowcol[1]
            },
        });

        // Games.insert({
        //     id: this.id,
        //     size: this.size,
        //     state: this.state,
        //     createdAt: new Date(),
        // });
    }

    getPlayerType() {
        const current = this.props.boards[0];

        if (current.authorType === 'guest' && current.authorId === localStorage.getItem('guest_id')) {
            return 1;
        }
        // Check user logged

        if (current.opponentType === 'guest' && current.opponentId === localStorage.getItem('guest_id')) {
            return 2;
        }
        // Check user logged
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
            if (localStorage.getItem('user_type') === 'guest') {
                Boards.update(this.props.boards[0]._id, {
                    $set: {
                        opponentType: 'guest',
                        opponentId: localStorage.getItem('guest_id'),
                        opponentUsername: localStorage.getItem('user_name'),
                    },
                });
            }
            this.allowed = true;
            return true;
        }

        return this.allowed;
    }

    render() {
        // console.log( this.props.game);

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
        // const history = this.state.history;
        // const current = history[this.state.stepNumber];
        const current = this.props.boards[0];
        // const winner = calculateWinner(current.squares);
        console.log(this.props.boards[0]);
        const winner = this.checkWinner(current.dots);

        // const moves = history.map((step, move) => {
        //     const desc = move ?
        //         'Go to move #' + move :
        //         'Go to game start';
        //     return (
        //         <li key={move}>
        //             <button onClick={() => this.jumpTo(move)}>{desc}</button>
        //         </li>
        //     );
        // });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (current.whiteIsNext ? "White" : "Black");
        }

        return (
            <div className="game">
                <h1>Game {current.game}</h1>
                <div>
                    {current.authorUsername}
                    {" VS "}
                    {current.opponentUsername}
                </div>
                <div className="game-board">
                    <Board
                        dots={current.dots}
                        size={current.size}
                        last={current.last}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    {/*<ol>{moves}</ol>*/}
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        boards: Boards.find({_id: FlowRouter.getParam('_id')}).fetch(),
    };
})(Game);