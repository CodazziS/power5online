import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

export default class LastGame extends Component {
    render() {
        let userId = localStorage.getItem('guest_id');
        let result = 'drawTrophy';
        let opponent = null;
        const game = this.props.game;
        const T = i18n.createComponent();

        if (Meteor.user()) {
            userId = Meteor.user()._id;
        }

        if (game.draw) {
            result = 'drawTrophy';
        } else if (game.authorId === userId && game.winnerIsAuthor ||
            game.opponentId === userId && !game.winnerIsAuthor) {
            result = 'winnerTrophy';
        } else if (game.authorId === userId && !game.winnerIsAuthor ||
            game.opponentId === userId && game.winnerIsAuthor) {
            result = 'loserTrophy';
        }

        if (game.authorId === userId) {
            opponent = game.opponentUsername;
        } else {
            opponent = game.authorUsername;
        }
        return (
            <div className="home_box_row">
                <div className="home_box_col40"><span className={result}></span></div>
                <div className="home_box_col115">{game.game}</div>
                <div className="home_box_col115"><strong>{opponent}</strong></div>
                <div className="home_box_col90">
                    <button onClick={this.props.onClick.bind(this)}><T>BTN_REVIEW</T></button>
                </div>
            </div>
        );
    }
}
