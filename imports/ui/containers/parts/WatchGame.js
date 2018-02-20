import React, { Component } from 'react';
import i18n from 'meteor/universe:i18n';
import {Meteor} from 'meteor/meteor';

export default class LaunchedGame extends Component {

    render() {
        const game = this.props.game;
        const T = i18n.createComponent();

        return (
            <div className="home_box_row">
                <div className="home_box_col125">{game.authorUsername}</div>
                <div className="home_box_col125">{game.opponentUsername}</div>
                <div className="home_box_col110 alright">
                    <button onClick={this.props.onClick.bind(this)}><T>GO_VISITOR</T></button>
                </div>
            </div>
        );
    }
}