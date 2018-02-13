import React from 'react';

export default class ToggleButton extends React.Component {
    render() {
        return (
            <div className="toggleButton">
                <span className="toggleButtonLabel">
                    {this.props.check ? 'Partie privée' : 'Partie publique'}
                </span>
                <label className="toggleButtonSwitch" onClick={this.props.onClick}>
                    <input type="checkbox" defaultChecked={this.props.check} />
                    <span className="toggleButtonSlider"></span>
                </label>
            </div>
        );
    }
};