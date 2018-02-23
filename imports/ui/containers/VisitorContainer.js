/*global VisitorContainer*/
/*eslint no-undef: "error"*/
import { Meteor } from 'meteor/meteor';
import { Boards } from '../../api/boards';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Visitor from './pages/Visitor.js';

export default VisitorContainer = withTracker(() => {
    const boardHandle = Meteor.subscribe('publicGame');
    const loading = !boardHandle.ready();
    const board = Boards.findOne(FlowRouter.getParam('_id'));
    const boardExist = !loading && !!board;

    return {
        loading,
        boardExist,
        board: boardExist ? board : null,
    };
})(Visitor);

