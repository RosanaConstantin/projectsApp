
(function () {
    var _ = require('underscore');
    var util = require('../../util');

    module.exports = {
        version: '1.0.0',
        initialize: function () {
            return this;
        },
        validateUserRequest: function (request, response) {
            var user = request.user;

            util.ResponseWrapper.override(response);

            if (!user) {
                response.error(400, 'Can\'t retrieve current user details: Session Token is null or invalid.');
            }

            var sessionToken = user.getSessionToken();

            if (!sessionToken) {
                response.error(400, 'Invalid session token.');
            }

            return (!response.errorTriggered);
        }
    }
}());
