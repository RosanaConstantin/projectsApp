
(function () {
    var util = require('../../util'),
        userUtil = require('../User/user.util'),
        entity = util.entity;

    module.exports = {
        version: '1.0.0',
        create: _createProject,
        update: _updateProject,
        get: _getProject,
        delete: _deleteProject,
    };

    function _createProject(request, response) {
        if (!userUtil.validateUserRequest(request, response)) {
            return;
        }

        if (!util.validateRequestParams(request, response, ['name', 'client'])) {
            return;
        }

        var user = request.user;
        var Project = entity.Project;
        var project = new Project();

        project.set('name', request.params['name']);
        project.set('client', request.params['client']);

        if(user.get('type') === util.getConstantValue('UserType', 'User')){
            project.set('userId', user.id)
        }
        project.save(null, {useMasterKey: true})
            .then(function (project) {
                response.success(project);
            })
            .catch(function (reason) {
                response.error(400, reason.message);
            });
    }

    function _updateProject(request, response) {
        if (!userUtil.validateUserRequest(request, response)) {
            return;
        }

        if (!util.validateRequestParams(request, response, ['project', 'projectId'])) {
            return;
        }

        var user = request.user;
        var sessionToken = user.getSessionToken();
        var query = new Parse.Query(entity.Project);
        var changes = request.params['project'];
        var id = request.params['projectId'];

        query
            .get(id, {sessionToken: sessionToken})
            .then(function (project) {
                if(!project) {
                    response.error(400, "No project found for specified id");
                }
                return util.updateObject(project, ['name', 'client'], changes)
                    .save(null, {sessionToken: sessionToken});
            })
            .then(function (result) {
                response.success(result);
            })
            .catch(function (reason) {
                response.error(400, reason.message);
            });
    }

    function _deleteProject(request, response) {
        if (!userUtil.validateUserRequest(request, response)) {
            return;
        }

        if (!util.validateRequestParams(request, response, ['projectId'])) {
            return;
        }
        
        var user = request.user;
        var sessionToken = user.getSessionToken();
        var query = new Parse.Query(entity.Project);

        query
            .get(request.params['projectId'], {sessionToken: sessionToken})
            .then(function (project) {
                if(!project) {
                    response.error(400, "No project found for specified id");
                }

                return project.destroy({useMasterKey: true});
            })
            .then(function (result) {
                response.success(
                    {
                        "successfully": true,
                        "message": "Project deleted!"
                    });
            })
            .catch(function (reason) {
                response.error(400, reason.message);
            })
    }

    function _getProject(request, response) {
        if (!userUtil.validateUserRequest(request, response)) {
            return;
        }

        var user = request.user;
        var sessionToken = user.getSessionToken();
        var query = new Parse.Query(entity.Project);
        var userType = user.get('type');

        if(userType === util.getConstantValue('UserType', 'User')){
            query.equalTo('userId', user.id);
        }

        query
            .find({sessionToken: sessionToken})
            .then(function (projects) {
                response.success(projects);
            })
            .then(function (reason) {
                response.error(400, reason.message);
            })
    }

}());