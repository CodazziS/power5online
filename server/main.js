import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import '../imports/api/boards.js';
import '../imports/api/users.js';

import Power5Migration from '../imports/Migrations/Power5Migration.js';

Meteor.startup(() => {
    new Power5Migration();

});
