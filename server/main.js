import { Meteor } from 'meteor/meteor';
import '../imports/api/boards.js';
import '../imports/api/users.js';

import Power5Migration from '../imports/Migrations/Power5Migration.js';

Meteor.startup(() => {
    let migrations = new Power5Migration();

});
