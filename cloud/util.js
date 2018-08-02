
(function () {
    var _ = require('underscore');

    var configCache = {
        'UserType': {
            'User': 1,
            'Admin': 2
        }
    };

    module.exports = {
        version: '1.0.0',
        initialize: function () {
            return this;
        },
        entity: {
            Role: Parse.Object.extend('Role'),
            User: Parse.User,
            Project: Parse.Object.extend('Project'),
            Pointer: function (className, objectId) {
                this["__type"] = "Pointer";
                this["className"] = className;
                this["objectId"] = objectId;
            }
        },
        ResponseWrapper: {
            override: function (response) {
                response.errorTriggered = false;
                var original = response.error;
                response['error'] = function () {
                    this.errorTriggered = true;
                    return original.apply(this, arguments);
                };
                return response;
            }
        },
        validateRequestParams: function (request, response, requiredParams) {
            this.ResponseWrapper.override(response);

            _.forEach(requiredParams, function (param) {
                if (!request.params[param]) {
                    response.error(400, 'Parameter ' + param + ' is missing or empty');
                }
            });

            return !response.errorTriggered;
        },
        getConfig: function (key) {
            return configCache[key];
        },
        getConstantValue: function (configKey, constantKey) {
            return parseFloat(_getConfigItem(configKey, constantKey, true));
        },
        updateObject: function (object, objectKeys, changes) {
            _.forEach(objectKeys, function (key) {
                if (!!changes[key]) {
                    object.set(key, changes[key]);
                }
            });

            return object;
        },
    };

    function _getConfigItem(configKey, item, isKey) {
        var config = module.exports.getConfig(configKey);
        if (isKey) {
            return config[item];
        } else {
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    var value = config[key];
                    if (value === item) {
                        return key;
                    }
                }
            }
        }
    }
}());
