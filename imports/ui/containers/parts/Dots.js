import React, { Component } from 'react';

export default class Board extends Component {

    render() {
        return (
            <div className={this.props.classname} onClick={() => this.props.onClick()}>
                <div className={this.props.value}></div>
            </div>
        );
    }
}
