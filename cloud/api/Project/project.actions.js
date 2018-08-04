
(function () {
    var util = require('../../util'),
        userUtil = require('../User/user.util'),
        entity = util.entity;

    module.exports = {
        version: '1.0.0',
        create: _createProject,
        update: _updateProject,
        get: _getProject,
        getAll: _getProjects,
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
        var sessionToken = user.getSessionToken();
        var Project = entity.Project;
        var project = new Project();

        project.set('name', request.params['name']);
        project.set('client', request.params['client']);
        project.set("parent", new entity.Pointer("_User", user.id))

        var acl = new Parse.ACL(user);
        project.setACL(acl);

        project.save(null, {sessionToken:sessionToken})
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
        
         if (!util.validateRequestParams(request, response, ['projectId'])) {
            return;
        }

        var user = request.user;
        var sessionToken = user.getSessionToken();
        var query = new Parse.Query(entity.Project);
        var userType = user.get('type');
        var options = {};

        if(userType === util.getConstantValue('UserType', 'Admin')){
            options.useMasterKey = true;
        } else {
            options.sessionToken = sessionToken;
        }
        query
            .get(request.params['projectId'], options)
            .then(function (project) {
                response.success(project);
            })
            .then(function (reason) {
                response.error(400, reason.message);
            })
    }

    function _getProjects(request, response) {
        if (!userUtil.validateUserRequest(request, response)) {
            return;
        }

        var user = request.user;
        var sessionToken = user.getSessionToken();
        var query = new Parse.Query(entity.Project);
        var userType = user.get('type');
        var options = {};

        if(userType === util.getConstantValue('UserType', 'Admin')){
            options.useMasterKey = true;
        } else {
            options.sessionToken = sessionToken;
        }
        query
            .find(options)
            .then(function (projects) {
                response.success(projects);
            })
            .then(function (reason) {
                response.error(400, reason.message);
            })
    }
}());
