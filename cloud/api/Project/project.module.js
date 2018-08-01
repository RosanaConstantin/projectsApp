
(function () {
    var projectActions = require('./project.actions');

    const MODULE_PREFIX = 'project-';

    module.exports = {
        version: '1.0.0',
        initialize: function (parentPrefix) {
            var prefix = parentPrefix + MODULE_PREFIX;

            Parse.Cloud.define(prefix + 'create', userActions.create);
            Parse.Cloud.define(prefix + 'update', userActions.update);
            Parse.Cloud.define(prefix + 'get', userActions.get);
            Parse.Cloud.define(prefix + 'delete', userActions.delete);

            return this;
        }
    };

}());