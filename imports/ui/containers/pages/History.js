import React from 'react';
import i18n from 'meteor/universe:i18n';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ReactPaginate from 'react-paginate';

import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Panel from '../components/Panel.js';
import GamesLines from '../components/GamesLines.js';



export default class History extends React.Component {
    constructor(props) {
        super(props);
        this.linePerPages = 10;
        this.state = {
            page: 0
        };
    }

    goToGameVisitor(gameId) {
        if (gameId !== null) {
            FlowRouter.go('game.spec', {_id: gameId});
        }
    }

    renderGames() {
        let offset = this.state.page * this.linePerPages;
        let filteredGames = this.props.games.slice(offset, offset + this.linePerPages);

        return (
            <GamesLines
                games={filteredGames}
                putMyScore="40"
                putGameName="auto"
                putMyOpponent="auto"
                putGameDate="auto"
                putButtonVisitor="auto"
                onClick={this.goToGameVisitor}
            />
        );
    }

    renderPagination() {
        let self = this;
        let pages = Math.round(this.props.gamesCount / this.linePerPages);
        return (<ReactPaginate
                previousLabel="<"
                nextLabel=">"
                breakLabel={<a href="">...</a>}
                breakClassName={'pagination_break'}
                pageCount={pages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={function(data) {
                    self.setState({page: data.selected});
                }}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'} />
        );
    }

    render() {
        const T = i18n.createComponent();

        if (this.props.loading) {
            return (<Panel type='warn' text='HISTORY_LOADING' />);
        }

        return (
            <div className="container">
                <Header
                    title="HISTORY_TITLE"
                />
                <div className="content">
                    <div className="history_content">
                        { this.renderGames() }
                        { this.renderPagination() }
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
