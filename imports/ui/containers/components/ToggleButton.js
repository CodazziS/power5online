import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class ToggleButton extends React.Component {
    render() {
        const T = i18n.createComponent();
        console.log(this.props.check);
        return (
            <div className="toggleButton">
                <label className="toggleButtonSwitch" onClick={this.props.onClick}>
                    <input type="checkbox" defaultChecked={this.props.check} />
                    <span className={'toggleButtonSlider' + (this.props.check ? ' checked' : '')}></span>
                </label>
                <span className="toggleButtonLabel">
                    <T>{this.props.check ? 'GAME_PRIVATE' : 'GAME_PUBLIC'}</T>
                </span>
            </div>
        );
    }
}