
(function () {
    var userActions = require('./user.actions');

    const MODULE_PREFIX = 'user-';

    module.exports = {
        version: '1.0.0',
        initialize: function (parentPrefix) {
            var prefix = parentPrefix + MODULE_PREFIX;

            Parse.Cloud.define(prefix + 'create', userActions.create);
            Parse.Cloud.define(prefix + 'login', userActions.login);

            return this;
        }
    };

}());