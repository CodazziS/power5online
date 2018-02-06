import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Boards } from '../../api/boards.js';
import { FlowRouter } from 'meteor/kadira:flow-router';

export default class App extends Component {

    handleSubmit(event) {
        event.preventDefault();

        // Find the text field via the React ref
        const name = ReactDOM.findDOMNode(this.refs.gameName).value.trim();
        const size = ReactDOM.findDOMNode(this.refs.gameSize).value.trim();

        let user_id = null;
        if (localStorage.getItem('user_type') === 'guest') {
            user_id = localStorage.getItem('guest_id');
        }

        let board_id = Boards.insert({
            size: size,
            game: name,
            dots: this.dotsGeneration(size),
            whiteIsNext: true,
            authorType: localStorage.getItem('user_type'),
            authorId: user_id,
            authorUsername: localStorage.getItem('user_name'),
            opponentType: null,
            opponentId: null,
            opponentUsername: null,
            createdAt: new Date(),
        });
        // // Clear form
        // ReactDOM.findDOMNode(this.refs.gameName).value = '';
        FlowRouter.go('game.show', {_id: board_id});
    }

    dotsGeneration(size) {
        let dots = [];
        let rows = 0;
        let id = 0;

        for(rows; rows < size; rows++) {
            let cols = 0;
            let dotsRow = [];
            for (cols; cols < size; cols++) {
                dotsRow.push({id: id++, state: null});
            }
            dots.push(dotsRow);
        }
        return dots;
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Power5</h1>
                </header>
                <div className="game">
                    <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                        <input
                            type="text"
                            ref="gameName"
                            placeholder="GameName"
                        /><br />
                        <input
                            type="number"
                            min="6"
                            max="20"
                            ref="gameSize"
                            placeholder="GameName"
                        />
                        <input type="submit"/>
                    </form>
                </div>
            </div>
        );
    }
}
