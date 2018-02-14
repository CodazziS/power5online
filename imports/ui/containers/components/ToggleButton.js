import React from 'react';

export default class ToggleButton extends React.Component {
    render() {
        const T = i18n.createComponent();
        return (
            <div className="toggleButton">
                <label className="toggleButtonSwitch" onClick={this.props.onClick}>
                    <input type="checkbox" defaultChecked={this.props.check} />
                    <span className="toggleButtonSlider"></span>
                </label>
                <span className="toggleButtonLabel">
                    <T>{this.props.check ? 'GAME_PRIVATE' : 'GAME_PUBLIC'}</T>
                </span>
            </div>
        );
    }
}