
(function () {
    var util = require('../../util');
        entity = util.entity;

    module.exports = {
        version: '1.0.0',
        create: _createProject,
        update: _updateProject,
        get: _getProject,
        delete: _deleteProject,
    };

    function _createProject(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }

    }

    function _updateProject(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }
    }

    function _deleteProject(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }

    }

    function _getProject(request, response) {
        if (!util.validateRequestParams(request, response, ['email', 'password'])) {
            return;
        }

    }

}());