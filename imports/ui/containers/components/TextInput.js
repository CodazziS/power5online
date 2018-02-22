import React from 'react';

export default class TextInput extends React.Component {
    render() {
        return (
            <input
                type="text"
                defaultValue={this.props.username}
                placeholder={this.props.placeholder}
                onChange={this.props.onChange}
            />
        );
    }
}