var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var expressjwt = require("express-jwt");
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
            Users.find(query, { credentials: 0 })
                .skip((req.query.page != undefined && req.query.page > 0 ) ? (req.query.page - 1) * limit : 0).limit(limit)
                .exec(),
            Users.find(query).count().exec()
        ]).spread(function(users, count) {
            res.status(200).json({ message : "OK", data : { count: count, users: users }});
        }, function(err) {
            return next(err);
        });
    }
);


/**
 * @api {post} /users Add a new user
 * @apiName PostUsers
 * @apiGroup Users
 *
 *
 * @apiSuccess {ObjectID} message
 *
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 4xx Not Found
 *     {
 *       "error"        : "User not found",
 *       "stacktrace"   : {}
 *     }
 */
router.post('/', function(req, res, next) {
    next();
});

router.get('/:id', function(req, res, next) {
    next();
});

router.put('/:id', function(req, res, next) {
    next();
});

router.delete('/:id', function(req, res, next) {
    next();
});

module.exports = router;
