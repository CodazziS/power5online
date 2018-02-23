import React, { Component } from 'react';
import i18n from 'meteor/universe:i18n';
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
            <div className="home_box_row">
                <div className="home_box_col125">
                    <strong><T>{this.isMyTurn(userId, game) ? 'PART_LAUNCH_GAME_MY_TURN' : 'PART_LAUNCH_GAME_OPPONENT_ROUND'}</T></strong>
                </div>
                <div className="home_box_col125">{opponent}</div>
                <div className="home_box_col110 alright">
                    <button onClick={this.props.onClick.bind(this)}><T>PART_LAUNCH_GAME_PLAY</T></button>
                </div>
            </div>
        );
    }
}