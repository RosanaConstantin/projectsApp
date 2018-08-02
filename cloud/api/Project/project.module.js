
(function () {
    var projectActions = require('./project.actions');

    const MODULE_PREFIX = 'project-';

    module.exports = {
        version: '1.0.0',
        initialize: function (parentPrefix) {
            var prefix = parentPrefix + MODULE_PREFIX;

            Parse.Cloud.define(prefix + 'create', projectActions.create);
            Parse.Cloud.define(prefix + 'update', projectActions.update);
            Parse.Cloud.define(prefix + 'get', projectActions.get);
            Parse.Cloud.define(prefix + 'delete', projectActions.delete);

            return this;
        }
    };

}());