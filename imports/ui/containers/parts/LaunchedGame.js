import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

export default class LaunchedGame extends Component {
    render() {
        let userId = localStorage.getItem('guest_id');
        let opponent = null;
        const game = this.props.game;

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
                <td><strong>{this.props.game.game}</strong></td>
                <td>{opponent}</td>
                <td><button onClick={this.props.onClick.bind(this)}>Reprendre</button></td>
            </tr>
        );
    }
}