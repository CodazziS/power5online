import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

export default class LaunchedGame extends Component {

    isMyTurn(userId, current) {
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

    render() {
        let userId = localStorage.getItem('guest_id');
        let opponent = null;
        const game = this.props.game;
        const T = i18n.createComponent();

        if (Meteor.user()) {
            userId = Meteor.user()._id;
        }

        if (game.authorId === userId) {
            opponent = game.opponentUsername;
        } else {
            opponent = game.authorUsername;
        }
        return (
            <tr>
                <td><strong><T>{this.isMyTurn(userId, game) ? 'MY_ROUND' : 'OPPONENT_ROUND'}</T></strong></td>
                <td>{opponent}</td>
                <td><button onClick={this.props.onClick.bind(this)}><T>GO_BACK_PLAY</T></button></td>
            </tr>
        );
    }
}