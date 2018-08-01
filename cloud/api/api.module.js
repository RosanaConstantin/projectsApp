/**
 * API Module
 * @name API Module
 * @namespace
 * @author Bogdan Niculescu bogdan.niculescu@ab4.systems
 *
 */
(function () {
    var user = require("./User/user.module");
    var project = require("./Project/project.module");

    const MODULE_PREFIX = 'api-';

    module.exports = {
        version: '1.0.0',
        initialize: function () {

            // Actions initialize
            user.initialize(MODULE_PREFIX);
            project.initialize(MODULE_PREFIX);
            return this;
        }
    };

}());