/**
 * Created by ekersale on 19/09/16.
 */


var express = require('express');
var router = express.Router();
var expressjwt = require("express-jwt");
var Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;

/*
 ** BD models requires --> mongodb
 */
var Locations = require("../../models/sites");


/**
 * @api {get} /locations?q=""&limit=""&page=""  Request locations information
 * @apiName GetLocation
 * @apiGroup Locations
 *
 * @apiParam    {string}    q                   Search query in name - lastname - email
 * @apiParam    {Number}    limit               Limit the number of return results
 * @apiParam    {Number}    page                Specify page wanted
 *
 * @apiSuccess  {String}     message             Specific message return by server, OK by default
 * @apiSuccess  {Number}     data.count          Number of results without limit
 * @apiSuccess  {ObjectID}   data._id            Location ID
 * @apiSuccess  {String}     data.name           Location name
 * @apiSuccess  {Number}     data.employeesNb    Location employees number
 * @apiSuccess  {ObjectID[]} data.admin          Groups admin of that location
 * @apiSuccess  {ObjectID[]} data.members        Users referring to that location
 * @apiSuccess  {Date}       data.created_at     Creation date of the object location
 * @apiSuccess  {Date}       data.updated_at     Updated date of the object location
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "OK",
 *       "data": {
 *           "count": 1,
 *           "locations": {
 *                "_id"         : "57d692f861ce72068fa04697",
 *                 "name"       : "Mougins",
 *                 "employeesNb": 120,
 *                 "created_at" : "2016-09-12T11:35:20.000Z",
 *                 "updated_at" : "2016-09-12T11:35:20.000Z",
 *                 "admin"      : [],
 *                 "members"    : [
 *                      "57d6a05f61ce72068fa0469b"
 *                 ]
 *              }
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal server error
 *     {
 *       "error"        : "",
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
                { 'name': { $regex: new RegExp(req.query.q, "i") } }];
        }
        Promise.all([
            Locations.find(query)
                .skip((req.query.page != undefined && req.query.page > 0 ) ? (req.query.page - 1) * limit : 0).limit(limit)
                .exec(),
            Locations.find(query).count().exec()
        ]).spread(function(locations, count) {
            res.status(200).json({ message : "OK", data : { count: count, locations: locations }});
        }, function(err) {
            return next(err);
        }).catch(function(err) {
            res.status(200).json({ message: "OK", data: { count: 0, locations: []}, error: err})
        });
    }
);

/**
 * @api {get} /locations/:id Request locations information
 * @apiName GetLocationByID
 * @apiGroup Locations
 *
 * @apiParam    {ObjectID}  id                   Search query in name - lastname - email
 *
 * @apiSuccess  {String}     message             Specific message return by server, OK by default
 * @apiSuccess  {Number}     data.count          Number of results without limit
 * @apiSuccess  {ObjectID}   data._id            Location ID
 * @apiSuccess  {String}     data.name           Location name
 * @apiSuccess  {Number}     data.employeesNb    Location employees number
 * @apiSuccess  {ObjectID[]} data.admin          Groups admin of that location
 * @apiSuccess  {ObjectID[]} data.members        Users referring to that location
 * @apiSuccess  {Date}       data.created_at     Creation date of the object location
 * @apiSuccess  {Date}       data.updated_at     Updated date of the object location
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "OK",
 *       "data": {
 *           "location": {
 *                "_id"         : "57d692f861ce72068fa04697",
 *                 "name"       : "Mougins",
 *                 "employeesNb": 120,
 *                 "created_at" : "2016-09-12T11:35:20.000Z",
 *                 "updated_at" : "2016-09-12T11:35:20.000Z",
 *                 "admin"      : [],
 *                 "members"    : [
 *                      "57d6a05f61ce72068fa0469b"
 *                 ]
 *              }
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal server error
 *     {
 *       "error"        : "",
 *       "stacktrace"   : {}
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Internal server error
 *     {
 *       "error"        : {
 *          "message"   : "Location nof found"
 *       }
 *     }
 */
router.get('/:id',
    expressjwt({ secret: process.env.jwtSecretKey}),
    function(req, res, next) {
        Locations.findOne({_id : new ObjectId(req.params.id)})
            .exec(function(err, location){
                if (err) return next(err);
                else if (!location) return res.status(404).json({
                    error : {
                        message : "Location id not found"
                    }
                });
                else return res.status(200).json({
                    message         : "OK",
                    data            : {
                        location   : location
                    }
                });
            });
    }
);


module.exports = router;
