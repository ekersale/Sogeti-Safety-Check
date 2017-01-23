var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var expressjwt = require("express-jwt");
var permissions = require("../../permissions");
var CryptoJS = require('crypto-js');
var shortid = require('shortid');

/*
 ** BD models requires --> mongodb
 */
var Users = require("../../models/users");

/**
 * @api {get} /users?q=""&limit=""&page=""  Request user's informations
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiParam    {string}    q                   Search query in name - lastname - email
 * @apiParam    {Number}    limit               Limit the number of return results
 * @apiParam    {Number}    page                Specify page wanted
 *
 * @apiSuccess {String}     message             Specific message return by server, OK by default
 * @apiSuccess {Number}     data.count          Number of results without limit
 * @apiSuccess {ObjectID}   data._id            User ID
 * @apiSuccess {String}     data.name.first     User first name
 * @apiSuccess {String}     data.name.last      User last name
 * @apiSuccess {String}     data.email          User email
 * @apiSuccess {Number}     data.phone          User phone number
 * @apiSuccess {String}     data.function       User function in the company
 * @apiSuccess {String}     data.state          User activity
 * @apiSuccess {String}     data.home           User living place
 * @apiSuccess {Boolean}    data.geoloc         User choice regarding geolocalization authorization
 * @apiSuccess {ObjectID}   data.sites           User place of work referring to a sites model
 * @apiSuccess {ObjectID}   data.events         User events referring to an array of event model
 * @apiSuccess {ObjectID}   data.profileImg     User profile image referring to media model
 * @apiSuccess {ObjectID}   data.contacts       User favorites contacts referring to an array of user model
 * @apiSuccess {ObjectID}   data.permission     User permissions referring to permission model
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "OK",
 *       "data": {
 *           "count": 1,
 *           "users": [
 *              {
 *                  "_id": "57d6a05f61ce72068fa0469b",
 *                  "email": "john.doe@gmail.com",
 *                  "phone": "0698128977",
 *                  "function": "Developer de génie",
 *                  "state": "active",
 *                  "allowGeoloc": true,
 *                  "location": "57d692f861ce72068fa04697",
 *                  "profileImg": "57d695e261ce72068fa04699",
 *                  "created_at": "2016-09-12T12:32:31.000Z",
 *                  "updated_at": "2016-09-12T12:32:31.000Z",
 *                  "chat": [
 *                      "57d6a47861ce72068fa0469f"
 *                  ],
 *                  "contacts": [
 *                      "57d6a10761ce72068fa0469d"
 *                  ],
 *                  "events": [
 *                      "57d68e2061ce72068fa04691"
 *                  ],
 *                  "participations": [],
 *                  "groups": [
 *                      "57d68eb361ce72068fa04695"
 *                  ],
 *                  "geoloc": {
 *                      "latitude": null,
 *                      "longitude": null
 *                  },
 *                  "living": {
 *                  "latitude": null,
 *                  "longitude": null
 *                  },
 *                  "name": {
 *                      "first": "John",
 *                      "last": "Doe"
 *                  }
 *              }
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 4xx Not Found
 *     {
 *       "error"        : "User not found",
 *       "stacktrace"   : {}
 *     }
 */
router.get('/',
    expressjwt({secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        var limit = parseInt((req.query.limit != undefined && req.query.limit > 0) ? req.query.limit : 20);
        var query = {};
        if (req.query.q != undefined) {
            query.$or = [
                { 'name.last': { $regex: new RegExp(req.query.q, "i") } },
                { 'name.first' : { $regex: new RegExp(req.query.q, "i") } },
                { email: { $regex: new RegExp(req.query.q, "i") } }
            ];
        }
        Promise.all([
            Users.find(query, { credentials: 0, chat: 0, contacts: 0 })
                .populate("profileImg", "relativePath")
                .skip((req.query.page != undefined && req.query.page > 0 ) ? (req.query.page - 1) * limit : 0).limit(limit)
                .exec(),
            Users.find(query).count().exec()
        ]).spread(function(users, count) {
            res.status(200).json({ message : "OK", data : { count: count, limit: limit, users: users }});
        }, function(err) {
            return next(err);
        });
    }
);

router.get('/:id',
    expressjwt({secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        if (req.user.id == req.params.id) {
            Users.findOne({_id : req.params.id}, {credentials: 0})
                .populate("profileImg", "relativePath")
                .populate([
                    {
                        path: "participations", model:"events", populate:
                        [
                            {
                                path: "author", model: "users", select: 'name profileImg _id',
                                populate: {path: "profileImg", model: "media", select: "relativePath -_id"}
                            },
                            {
                                path: "images", model: "media", select: "relativePath -_id"
                            }
                        ]
                    }
                ])
                .exec(function(err, user) {
                    if (err) return next(err);
                    else if (!user) return next(req.app.getError(404, "User not found",
                        {state: "ID may be incorrect"}));
                    else return res.status(200).json({
                            message     : "OK",
                            data        : {
                                user    : user
                            }
                        });
                });
        } else {
            Users.findOne({_id: req.params.id}, {credentials: 0, created_at: 0, updated_at: 0, chat: 0, contacts: 0})
                .populate("profileImg", "relativePath")
                .populate([
                    {
                        path: "participations", model:"events", populate:
                        [
                            {
                                path: "author", model: "users", select: 'name profileImg _id',
                                populate: {path: "profileImg", model: "media", select: "relativePath -_id"}
                            },
                            {
                                path: "images", model: "media", select: "relativePath -_id"
                            }
                        ]
                    }
                ])
                .exec(function(err,  user) {
                    if (err) return next(err);
                    else if (!user) return next(req.app.getError(404, "User not found",
                        {state: "ID may be incorrect"}));
                    else return res.status(200).json({
                            message     : "OK",
                            data        : {
                                user    : user
                            }
                        });
                });
        }
    });

var Media = require('../../models/media');

router.put('/:id',
    expressjwt({secret: process.env.jwtSecretKey}),
    permissions(["me", "adminGroups"]),
    function(req, res, next) {
        Users.findOne({_id: req.params.id})
            .exec(function(err, user) {
                if (err) return next(err);
                else if (!user) return next(req.app.getError(404, "User not found",
                    {state: "Impossible to update a user not found"}));
                else {
                    for (var key in req.body) {
                        if (key == "password" && req.body[key] != "")
                            user.credentials.password = CryptoJS.SHA256(req.body.password).toString();
                        else if (key == "profileImg" && req.body[key] != "") {
                            var media = new Media();
                            var filename = shortid.generate() + ".jpeg";
                            media.absolutePath = '/home/Sogeti/uploads/users/images/' + filename;
                            media.relativePath = 'http://198.27.65.200:3000/uploads/users/images/' + filename;
                            media.save();
                            var base64Data = req.body.profileImg.replace(/^data:image\/jpeg;base64,/, "");
                            var old = user.profileImg;
                            user.profileImg = media._id;
                            require("fs").writeFile(media.absolutePath, base64Data, 'base64', function(err) {
                                if (err) user.profileImg =  "https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png";
                                else {
                                    Media.findOneAndRemove({_id: old});
                                }
                            });
                        }
                        else if (user[key] != undefined && req.body[key] != "") {
                            user[key] = req.body[key];
                        }
                        else {}

                    }
                    user.save(function(err) {
                        if (err) return next(err);
                        else return res.status(200).json({
                            message      : "OK",
                            data         : {
                                user     : user
                            }
                        });
                    });
                }
            });
    });

router.delete('/:id',
    expressjwt({secret: process.env.jwtSecretKey}),
    permissions(["me", "adminGroups"]),
    function(req, res, next) {
        Users.findOneAndRemove({_id : req.params.id})
            .exec(function(err, report) {
                if (err) return next(err);
                else return res.status(200).json({
                    message     : "OK",
                    data        : {
                        report  : report
                    }
                })
            });
    });


router.get('/:id/groups',
    expressjwt({secret: process.env.jwtSecretKey}),
    permissions(["me", "adminGroups"]),
    function(req, res, next) {
        Users.findOne({_id: req.params.id })
            .populate("groups")
            .exec(function(err, user) {
                console.log(user);
                if (err) return next(err);
                else if (!user) return next(req.app.getError(404, "Invalid token, user not found"));
                else return res.status(200).json({
                        message : "OK",
                        data    : {
                            groups : user.groups
                        }
                    });
            });
    }
);

module.exports = router;
