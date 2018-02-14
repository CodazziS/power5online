import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class Panel extends React.Component {
    render() {
        const T = i18n.createComponent();
        return (
            <div className="panel">
                <h2 className={this.props.type}><T>{this.props.text}</T></h2>
                <a href="/"><T>GO_TO_HOME</T></a>
            </div>
        );
    }
}