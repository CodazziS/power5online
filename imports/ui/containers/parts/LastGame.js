import React, { Component } from 'react';
import {Meteor} from "meteor/meteor";

export default class LastGame extends Component {
    render() {
        let user_id = localStorage.getItem('guest_id');
        let result = 'drawTrophy';
        let opponent = null;
        const game = this.props.game;

        if (Meteor.user()) {
            user_id = Meteor.user()._id;
        }

        if (game.authorId === user_id && game.winnerIsAuthor ||
            game.opponentId === user_id && !game.winnerIsAuthor) {
            result = 'winnerTrophy';
        } else if (game.authorId === user_id && !game.winnerIsAuthor ||
            game.opponentId === user_id && game.winnerIsAuthor) {
            result = 'loserTrophy';
        }

        if (game.authorId === user_id) {
            opponent = game.opponentUsername;
        } else {
            opponent = game.authorUsername;
        }
        return (
            <tr>
                <td><strong className={result}></strong></td>
                <td><strong>{game.game}</strong></td>
                <td>{opponent}</td>
                <td><button onClick={this.props.onClick.bind(this)}>Revoir</button></td>
            </tr>
        );
    }
}
