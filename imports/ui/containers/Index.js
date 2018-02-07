import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Boards } from '../../api/boards.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import AccountsUIWrapper from '../AccountsUIWrapper.js';
import { Meteor } from 'meteor/meteor';

export default class App extends Component {

    handleSubmit(event) {
        event.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.gameName).value.trim();
        const size = ReactDOM.findDOMNode(this.refs.gameSize).value.trim();
        const game = {
            size: parseInt(size),
            game: name,
            guest_id: localStorage.getItem('guest_id')
        };
        Meteor.call('boards.insert', game, function(error, result) {
            if (error) {
                alert('Votre partie n\'a pas pu être créée');
            } else {
                FlowRouter.go('game.show', {_id: result});
            }
        });
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Power5</h1>
                    <AccountsUIWrapper />
                </header>
                <div className="content">
                    <div id="newGameBlock">
                        <h2>Créer une nouvelle partie</h2>
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                            <span>Nom de la partie : </span>
                            <input
                                type="text"
                                ref="gameName"
                                defaultValue="My game"
                                placeholder="GameName"
                            /><br />
                            <span>Taille du plateau : </span>
                            <input
                                type="number"
                                min="6"
                                max="20"
                                ref="gameSize"
                                defaultValue="15"
                                placeholder="Game size"
                            /><br />
                            <input type="submit"/>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
