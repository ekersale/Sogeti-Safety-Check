/**
 * Created by ekersale on 26/09/2016.
 */

var Users = require("./models/users");

var permissions = function(groups) {
    return function(req, res, next) {
        if (groups.indexOf("all") != -1)
            return next();
        if (req.user.id == null || req.user.id == undefined) return next(req.app.getError(403, "Forbidden : user needs to be logged.", null));
        try {
            Users.findOne({_id: req.user.id}).populate("groups").exec(function (err, user) {
                if (err) return next(err);
                else if (user == null || user == undefined) return next(req.app.getError(403, "Unauthorized : invalid token", null));
                else {
                    req.user.admin = false;
                    for (var i = 0; i < groups.length; ++i) {
                        if (groups[i] == "logged") {
                            req.user.group = "logged";
                            return next();
                        }
                        else if (groups[i] == "me") {
                            if (user._id == req.user.id) {
                                req.user.group = "me";
                                return next();
                            }
                        }
                        else if (groups[i] == "groupsAdmin") {
                            var obj =  user.groups.filter(function ( obj ) {
                                return obj.admin === true;
                            })[0];
                            if (obj != null || obj.length > 0) {
                                req.user.adminGroups = obj;
                                return next();
                            }
                        }
                        else {
                            if (groups[i] == user.groups.name) {
                                req.user.group = groups[i];
                                return next();
                            }
                        }
                    }
                    return next(req.app.getError(403, "Forbidden: you need one of these privileges :" + groups));
                }
            });
        } catch (error) {
            return next(error);
        }
    }
};

module.exports = permissions;