import { Meteor } from 'meteor/meteor';
import '../imports/api/boards.js';
import '../imports/api/users.js';

import Power5Migration from '../imports/Migrations/Power5Migration.js';
import Statistics from './tasks/Statistics';

Meteor.startup(() => {
    let migrations = new Power5Migration();
    migrations.init();

    let statistics = new Statistics();
    statistics.calc(true);

    Meteor.setInterval(function() { statistics.calc(false) }, 1000 * 60 * 5);
    Meteor.setInterval(function() { statistics.calc(true) }, 1000 * 60 * 60);
});
