
(function () {
    var util = require('../../../util'),
        entity = util.entity;

    module.exports = {
        version: '1.0.0',
        initialize: function () {
            Parse.Cloud.afterSave(entity.Project, afterSave);
            return this;
        }
    };

    function afterSave(request) {
        var project = request.object;
        var user = request.user;
        var projectUser = project.get('userId');

        if(!projectUser) {
            var userId = user.id;
            project.add('userId', userId);

            return project.save(null, {useMasterKey: true});
        }
    }
}());