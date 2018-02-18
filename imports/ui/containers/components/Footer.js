import React from 'react';
import i18n from 'meteor/universe:i18n';

export default class Footer extends React.Component {
    render() {
        const T = i18n.createComponent();
        return (
            <footer>
                &copy; { (new Date()).getFullYear() } &nbsp;|&nbsp;
                <a target="_blank" href="https://codazzi.fr">
                    CodazziS
                </a>
                <a target="_blank" href="https://gitlab.com/stephane.codazzi/power5online">
                    <img src="/open-sources.png" />
                </a>
                V{Migrations.getVersion()}
            </footer>
        );
    }
}