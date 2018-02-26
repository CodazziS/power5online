import React, { Component } from 'react';
import i18n from 'meteor/universe:i18n';
import {Meteor} from 'meteor/meteor';

export default class GameLine extends Component {

    constructor(props) {
        super(props);
        this.games = this.props.games;
        this.userId = localStorage.getItem('guest_id');
        if (Meteor.user()) {
            this.userId = Meteor.user()._id;
        }

    }

    isUserTurn(game) {
        if (game.end) {
            return false;
        }
        if (game.whiteIsNext && game.creatorIsWhite && this.userId === game.authorId) {
            return true;
        }
        if (game.whiteIsNext && !game.creatorIsWhite && this.userId === game.opponentId) {
            return true;
        }
        if (!game.whiteIsNext && game.creatorIsWhite && this.userId === game.opponentId) {
            return true;
        }
        if (!game.whiteIsNext && !game.creatorIsWhite && this.userId === game.authorId) {
            return true;
        }
        return false;
    }

    renderMyScore(game, T) {
        let putMyScore = this.props.putMyScore;
        let result;

        if (putMyScore) {
            if (game.draw) {
                result = 'drawTrophy';
            } else if (game.authorId === this.userId && game.winnerIsAuthor ||
                game.opponentId === this.userId && !game.winnerIsAuthor) {
                result = 'winnerTrophy';
            } else if (game.authorId === this.userId && !game.winnerIsAuthor ||
                game.opponentId === this.userId && game.winnerIsAuthor) {
                result = 'loserTrophy';
            }

            return (
                <div className={"comp_game_line_" + putMyScore}><span className={result}></span></div>
            );
        }
    }

    renderMyOpponent(game, T) {
        let putMyOpponent = this.props.putMyOpponent;
        if (putMyOpponent) {
            let opponentUsername = (game.authorId === this.userId) ? game.opponentUsername : game.authorUsername;
            return (
                <div className={"comp_game_line_" + putMyOpponent}>{opponentUsername}</div>
            );
        }
    }

    renderGameName(game, T) {
        let putGameName = this.props.putGameName;
        if (putGameName) {
            return (
                <div className={"comp_game_line_" + putGameName}>{game.game}</div>
            );
        }
    }

    renderGameDate(game, T) {
        let putGameDate = this.props.putGameDate;
        let dateOpt = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };

        if (putGameDate) {
            return (
                <div className={"comp_game_line_" + putGameDate}>{game.lastActionAt.toLocaleDateString(i18n.getLocale(), dateOpt)}</div>
            );
        }
    }

    renderAuthor(game, T) {
        let putAuthor = this.props.putAuthor;
        if (putAuthor) {
            return (
                <div className={"comp_game_line_" + putAuthor}>{game.authorUsername}</div>
            );
        }
    }

    renderOpponent(game, T) {
        let putOpponent = this.props.putOpponent;
        if (putOpponent) {
            return (
                <div className={"comp_game_line_" + putOpponent}>{game.opponentUsername}</div>
            );
        }
    }

    renderMyTurn(game, T) {
        let putMyTurn = this.props.putMyTurn;
        if (putMyTurn) {
            return (
                <div className={"comp_game_line_" + putMyTurn}>
                    <strong><T>{this.isUserTurn(game) ? 'COMP_GAME_LINE_MY_TURN' : 'COMP_GAME_LINE_OPPONENT_TURN'}</T></strong>
                </div>
            );
        }
    }

    renderButtonRePlay(game, T) {
        let putButtonRePlay = this.props.putButtonRePlay;
        if (putButtonRePlay) {
            return (
                <div className={"comp_game_line_" + putButtonRePlay + " alright"}>
                    <button onClick={this.props.onClick.bind(this, game._id)}><T>COMP_GAME_LINE_REPLAY</T></button>
                </div>
            );
        }
    }

    renderButtonVisitor(game, T) {
        let putButtonVisitor = this.props.putButtonVisitor;
        if (putButtonVisitor) {
            return (
                <div className={"comp_game_line_" + putButtonVisitor + " alright"}>
                    <button onClick={this.props.onClick.bind(this, game._id)}><T>COMP_GAME_LINE_WATCH</T></button>
                </div>
            );
        }
    }

    renderLine(game, T) {

        return (
            <div key={game._id} className="comp_game_lines">
                {this.renderMyTurn(game, T)}
                {this.renderMyScore(game, T)}
                {this.renderGameName(game, T)}
                {this.renderMyOpponent(game, T)}
                {this.renderAuthor(game, T)}
                {this.renderOpponent(game, T)}
                {this.renderGameDate(game, T)}
                {this.renderButtonRePlay(game, T)}
                {this.renderButtonVisitor(game, T)}
            </div>
        );
    }

    render() {
        const T = i18n.createComponent();
        return this.props.games.map((game) => this.renderLine(game, T));
    }
}