
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
        },
        createWebsiteUser: function (requestParams) {
            var createUrl = util.getConfig('CreateAccount');

            return Parse.Cloud.httpRequest({
                method: 'POST',
                url: createUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestParams
            })
                .then(function (websiteResponse) {
                    return Parse.Promise.as(websiteResponse.data.data);
                })
                .catch(function (websiteResponse) {
                    var errorCode = websiteResponse.data.errors[0].code;

                    if (errorCode === 'taken') {
                        throw new Parse.Error(Parse.Error.EMAIL_TAKEN, 'There is already an account on DrFuhrman.com with that email address.');
                    }

                    throw new Parse.Error(400, websiteResponse.data.errors[0].message);
                });
        },
        loginWebsite: function (requestParams) {
            var loginUrl = util.getConfig('Login');

            return Parse.Cloud.httpRequest({
                method: 'POST',
                url: loginUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    username: requestParams['email'],
                    password: requestParams['password']
                }
            })
                .then(function (websiteResponse) {
                    return Parse.Promise.as(websiteResponse.data.data);
                });
        },
        accountInformationWebsite: function (authToken) {
            var accountInformationUrl = util.getConfig('AccountInformation');

            return Parse.Cloud.httpRequest({
                method: 'POST',
                url: accountInformationUrl,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    authToken: authToken
                }
            })
                .then(function (websiteResponse) {
                    return Parse.Promise.as(websiteResponse.data.data);
                });
        },
        getGbombs: function (nutrients, recipes) {
            return findGbombs(nutrients, recipes);
        },
        getScore: function (nutrients, recipes, profileId, sessionToken) {
            var scorePerDay = {};
            query = new Parse.Query(entity.UserProfile);

            return query
                .get(profileId, {sessionToken: sessionToken})
                .then(function (userProfile) {
                    var userInfo = {
                        'gender': userProfile.get('gender'),
                        'birthdate': userProfile.get('birthdate'),
                        'customBadge': userProfile.get('customBadge')
                    };

                    nutrients = getObjectsJson(nutrients);
                    recipes = getObjectsJson(recipes);
                    var nutrientScore = getNutrientScore(nutrients, recipes, userInfo);
                    scorePerDay.nutrientScore = nutrientScore;
                    var badge = getBadge(nutrientScore, userInfo);

                    if (badge !== '')
                        scorePerDay.badge = badge;

                    return Parse.Promise.when(
                        Parse.Promise.as(scorePerDay)
                    );
                });
        },
        calculateStatistics: function (nutrients, recipes, timezone, numberOfDays, profileId, sessionToken) {
            var statistics = [];
            query = new Parse.Query(entity.UserProfile);

            return query
                .get(profileId, {sessionToken: sessionToken})
                .then(function (userProfile) {
                    var userInfo = {
                        'gender': userProfile.get('gender'),
                        'birthdate': userProfile.get('birthdate'),
                        'customBadge': userProfile.get('customBadge')
                    };
                    for (var i = numberOfDays; i > 0; i--) {
                        var referenceDayStart = new Date(moment.tz(timezone).startOf('d').subtract(i, 'd'));
                        var referenceDayStop = new Date(moment.tz(timezone).endOf('d').subtract(i, 'd'));
                        var recipesList = [], nutrientsList = [];

                        for (var recipesIndex = 0; recipesIndex < recipes.length; recipesIndex++) {
                            if (referenceDayStart <= recipes[recipesIndex].get('createdAt') && referenceDayStop >= recipes[recipesIndex].get('createdAt')) {
                                recipesList.push(recipes[recipesIndex]);
                            }
                        }

                        for (var nutrientIndex = 0; nutrientIndex < nutrients.length; nutrientIndex++) {
                            if (referenceDayStart <= nutrients[nutrientIndex].get('createdAt') && referenceDayStop >= nutrients[nutrientIndex].get('createdAt')) {
                                nutrientsList.push(nutrients[nutrientIndex]);
                            }
                        }

                        nutrients = nutrients.filter(function (nutrient) {
                            return nutrientsList.indexOf(nutrient) === -1;
                        });

                        recipes = recipes.filter(function (recipe) {
                            return recipesList.indexOf(recipe) === -1;
                        });

                        var nutrientScore = getNutrientScore(nutrientsList, recipesList, userInfo);
                        var badge = getBadge(nutrientScore, userInfo);
                        var gbombs = findGbombs(nutrientsList, recipesList);

                        statistics.push({
                            nutrientScore: nutrientScore,
                            badge: badge,
                            GBOMBS: gbombs
                        });
                    }
                    return Parse.Promise.when(
                        Parse.Promise.as(statistics)
                    );
                });
        },
        retrievePhotoAndSave: function (url) {
            return Parse.Cloud.httpRequest({url: url})
                .then(function (httpImgFile) {
                    var data = {
                        base64: httpImgFile.buffer.toString('base64')
                    };
                    var file = new Parse.File('profileImage', data);
                    return file.save();
                });
        }
    };

    function getObjectsJson(objects) {
        var objectsJson = [];
        for (var i = 0; i < objects.length; i++) {
            objectsJson.push(objects[i].toJSON());

        }
        return objectsJson;
    }

    function getNutrientScore(nutrients, recipes, userInfo) {
        var nutrientScore = 0;
        nutrients = nutrientUtil.scaleNutrients(nutrients, userInfo.birthdate, userInfo.gender);
        recipes = nutrientUtil.scaleNutrients(recipes, userInfo.birthdate, userInfo.gender);

        for (var nutrientIndex = 0; nutrientIndex < nutrients.length; nutrientIndex++) {
            nutrientScore += nutrients[nutrientIndex].points * nutrients[nutrientIndex].servingSize;
        }

        for (var recipeIndex = 0; recipeIndex < recipes.length; recipeIndex++) {
            nutrientScore += recipes[recipeIndex].nutrientScore * recipes[recipeIndex].servingSize;
        }
        return Math.round(nutrientScore * 100) / 100;
    }

    function getNutrientList(nutrients, recipes) {
        var nutrientsList = [];
        for (var nutrientIndex = 0; nutrientIndex < nutrients.length; nutrientIndex++) {
            var nutrientJson = nutrients[nutrientIndex].toJSON();
            nutrientsList.push(nutrientJson);
        }

        for (var recipeIndex = 0; recipeIndex < recipes.length; recipeIndex++) {
            var recipeJson = recipes[recipeIndex].toJSON();
            nutrientsList = nutrientsList.concat(recipeJson.nutrients);
        }

        return nutrientsList;
    }

    function getBadge(nutrientScore, userInfo) {
        var age = moment.utc().diff(userInfo.birthdate, 'years');
        var femaleGenderValue = util.getConstantValue('Gender', 'female');
        var configBadges = util.getConfig('Badges');
        var badges = {};
        var customBadge = userInfo.customBadge;

        if (userInfo.birthdate && age < util.getConstantValue('Kid', 'age')) {
            badges = configBadges['kids'];
        } else if (userInfo.gender === femaleGenderValue) {
            badges = configBadges['female'];
        } else {
            badges = configBadges['male'];
        }

        if (customBadge) {
            badges = setCustomBadges(badges, customBadge);
        }
        var badge = establishesBadge(badges, nutrientScore);

        return util.getConstantValue('BadgeType', badge);
    }

    function setCustomBadges(badges, customBadge) {
        badges['brilliant'] = customBadge;
        badges['genius'] = customBadge + badges['adder'];
        return badges;
    }

    function establishesBadge(badges, nutrientScore) {
        var badge = '';
        if (nutrientScore >= badges['smart'] & nutrientScore < badges['brilliant'])
            badge = 'smart';
        else if (nutrientScore >= badges['brilliant'] & nutrientScore < badges['genius'])
            badge = 'brilliant';
        else if (nutrientScore >= badges['genius'])
            badge = 'genius';

        return badge;
    }

    function findGbombs(nutrients, recipes) {
        var nutrientsList = getNutrientList(nutrients, recipes);
        var gbombs = {
            'G': false,
            'Be': false,
            'O': false,
            'M': false,
            'Bi': false,
            'S': false
        };

        for (var nutrientIndex = 0; nutrientIndex < nutrientsList.length; nutrientIndex++) {
            if (nutrientsList[nutrientIndex].gbombType >= 0) {
                var gbombsItem = util.getConstantKey('GBOMBS', nutrientsList[nutrientIndex].gbombType);
                gbombs[gbombsItem] = true;
            }
        }

        return gbombs;
    }
}());
