
(function () {
    var util = require('../../util'),
        userUtil = require('./user.util'),
        client = require('../../../index').client,
        entity = util.entity;

    module.exports = {
        version: '1.0.0',
        create: _createUser,
        login: _loginUser
    };

    function _createUser(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }

        var requestParams = request.params;
        var user = new Parse.User();
        user.set('email', requestParams['email']);
        user.set('username', requestParams['email']);
        user.set('password', requestParams['password']);

        if(request.params['type']){
            user.set('type', util.getConstantValue('UserType', 'Admin'));
        } else {
            user.set('type', util.getConstantValue('UserType', 'User'));
        }

        user.signUp(null, {useMasterKey: true})
            .then(function (user) {
                client.set('objectId', user.id);
                client.expire('objectId', 300);
                response.success(user);
            })
            .catch(function (reason) {
                response.error(400, reason.message);
            })
    }

    function _loginUser(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }
        var params = request.params;

        Parse.User.logIn(params['email'], params['password'])
            .then(function (user) {
                client.set('objectId', user.id);
                client.expire('objectId', 300);
                response.success(user);
            })
            .catch(function (reason) {
                response.error(400, reason.message);
            });
    }
}());