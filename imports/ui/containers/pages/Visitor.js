import React, { Component } from 'react';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Board from '../parts/Board.js';
import Panel from '../components/Panel.js';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Button from '../components/Button.js';
import IconButton from '../components/IconButton';

export default class Visitor extends Component {

    constructor(props) {
        super(props);
        this._id = FlowRouter.getParam('_id');
        this.state = {
            step: null,
            analyser: false
        };
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

    analyseButton(analyser) {
        this.setState({analyser, step: 0});
    }

    setAnalyseStep(step) {
        let maxStep = this.props.board.step - 1;

        if (step >= this.props.board.step) {
            step = maxStep;
        }
        if (step < 0) {
            step = 0;
        }

        document.getElementById('analyser_step_input').value = step + ' / ' + maxStep;
        this.setState({step});
    }

    checkAccess() {
        if (this.props.loading) {
            return (<Panel type='warn' text='GAME_LOADING' />);
        }
        if (!this.props.boardExist) {
            return (
                <Panel type='error' text='GAME_PRIVATE' />
            );
        }
        return null;
    }

    dotsGeneration(size) {
        let dots = [];
        let rows = 0;
        let id = 0;

        for(rows; rows < size; rows++) {
            let cols = 0;
            let dotsRow = [];
            for (cols; cols < size; cols++) {
                dotsRow.push({id: id++, state: null, win: false});
            }
            dots.push(dotsRow);
        }
        return dots;
    }

    analyseStep(board) {
        let dots = this.dotsGeneration(board.size);
        const finalStep = this.state.step;
        let step = 0;

        for(step; step <= finalStep; step++) {
            let action = board.stepHistory[step];
            dots[action.row][action.col].state = action.state;
        }

        return dots;
    }

    renderAnalyzeBar() {
        if (this.state.analyser) {
            let step = this.state.step;
            let maxStep = this.props.board.step - 1;

            return (
                <div className="history_analyze_bar">
                    <IconButton text="VISITOR_ANALYZE_FIRST" icon="skip_previous" onClick={this.setAnalyseStep.bind(this, 0)}/>
                    <IconButton text="VISITOR_ANALYZE_PREV" icon="fast_rewind" onClick={this.setAnalyseStep.bind(this, step - 1)}/>
                    <input
                        type="text"
                        id="analyser_step_input"
                        className="disableInput"
                        defaultValue={step + ' / ' + maxStep}
                        disabled
                    />
                    <IconButton text="VISITOR_ANALYZE_NEXT" icon="fast_forward" onClick={this.setAnalyseStep.bind(this, step + 1)}/>
                    <IconButton text="VISITOR_ANALYZE_LAST" icon="skip_next" onClick={this.setAnalyseStep.bind(this, maxStep)}/>
                    <IconButton text="VISITOR_ANALYZE_CLOSE" icon="close" onClick={this.analyseButton.bind(this, false)}/>
                </div>
            );
        } else {
            return (
                <Button text="VISITOR_BUTTON_ANALYSE" onClick={this.analyseButton.bind(this, true)}/>
            );
        }
    }

    renderScoreBoard(board, replayButton) {
        return (
            <div className="scoreboard">
                <div className="scoreboardPlayer">
                    <div className={(board.whiteIsNext && !board.end) ? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
                        <div className="scoreboardPlayerWhite"></div>
                    </div>
                    <div className="scoreboardPlayerName">
                        <span className={(board.end && !board.draw && ((board.winnerIsAuthor && board.creatorIsWhite) || (!board.winnerIsAuthor && !board.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                        {(board.creatorIsWhite) ? board.authorUsername : board.opponentUsername}
                    </div>
                </div>

                <hr className="scoreboardSeparator"></hr>
                <span className="scoreboardSeparatorText">{' VS '}</span>
                <hr className="scoreboardSeparator"></hr>

                <div className="scoreboardPlayer">
                    <div className={(!board.whiteIsNext && !board.end)? 'scoreboardPlayerActive' : 'scoreboardPlayerNotActive'}>
                        <div className="scoreboardPlayerBlack"></div>
                    </div>
                    <div className="scoreboardPlayerName">
                        <span className={(board.end && !board.draw && ((board.winnerIsAuthor && !board.creatorIsWhite) || (!board.winnerIsAuthor && board.creatorIsWhite))) ? 'winnerTrophy' : ''}></span>
                        {(!board.creatorIsWhite) ? board.authorUsername : board.opponentUsername}
                    </div>
                </div>
                { replayButton }
                { this.renderAnalyzeBar() }
            </div>
        );
    }

    render() {
        const access = this.checkAccess();
        if (access !== null) {
            return access;
        }

        const current = this.props.board;
        let replayButton = '';
        let dots = current.dots;
        let last = current.last;

        if (this.state.analyser) {
            dots = this.analyseStep(current);
            last = null;
        }

        document.title = current.game;
        if (current.replayId) {
            replayButton = <Button text="VISITOR_FOLLOW_PLAYERS" onClick={(current) => this.replayButton(current)}/>;
        }

        return (
            <div className="container">
                <Header
                    title={current.game}
                />
                <div className="content">
                    <div id="gameScore">
                        { this.renderScoreBoard(current, replayButton) }
                    </div>
                    <div id="gameBoard" className="game-board">
                        <Board
                            dots={dots}
                            size={current.size}
                            last={last}
                            onClick={(i) => this.handleClick(i)}
                        />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
