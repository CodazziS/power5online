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
            <tr>
                <td><strong className={result}></strong></td>
                <td><strong>{game.game}</strong></td>
                <td>{opponent}</td>
                <td><button onClick={this.props.onClick.bind(this)}><T>BTN_REVIEW</T></button></td>
            </tr>
        );
    }
}
