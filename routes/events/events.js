/**
 * Created by ekersale on 11/10/2016.
 */

var express = require('express');
var router = express.Router();
var expressjwt = require("express-jwt");
var permissions = require("../../permissions");
var Promise = require('bluebird');
var ObjectId = require('mongoose').Types.ObjectId;
var Events = require('../../models/events');
var Media = require('../../models/media');
var User = require('../../models/users');

router.get('/',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        var limit = parseInt((req.query.limit != undefined && req.query.limit > 0) ? req.query.limit : 20);
        var query = {};
        if (req.query.q != undefined) {
            query.$or = [
                { 'name': { $regex: new RegExp(req.query.q, "i") }}
            ];
        }
        Promise.all([
            Events.find(query)
                .skip((req.query.page != undefined && req.query.page > 0 ) ? (req.query.page - 1) * limit : 0).limit(limit)
                .populate([
                    {
                        path: "images", model: "media", select: "relativePath -_id"
                    },
                    {
                        path: "participants", model: "users", select: "name id"
                    },
                    {
                        path: "author", model: "users", select: "name id profileImg",
                        populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
                    }
                ])
                .exec(),
            Events.find(query).count().exec()
        ]).spread(function(events, count) {
            res.status(200).json({ message : "OK", data : { count: count, limit: limit, events: events }});
        }, function(err) {
            return next(err);
        });
    }
);

router.get('/:id',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Events.findOne({_id: req.params.id})
            .exec(function(err, event) {
                if (err) return next(err);
                else if (!res) return next(req.app.getError(404, "Event not found"));
                else return res.status(200).json({
                        message     : "OK",
                        data        : {
                            event   :  event
                        }
                    });
            });
    }
);

router.post('/:id/subscribe',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function (req, res, next) {
        User.findOne({_id: req.user.id})
            .exec(function(err, user) {
               if (err) return next(err);
                else if (!user) return next(400, "User must reload himself");
                else {
                    if (user.participations.indexOf(req.params.id) != -1)
                        return next(req.app.getError(409, 'User already subscribed to this event'));
                    else {
                        Events.findOne({_id: req.params.id})
                            .exec(function(err, event) {
                               if (err) return next(err);
                                else if (!event) return next(req.app.getError(404, 'Event not found'));
                                else {
                                    event.participants.push(user._id);
                                    event.save();
                                    user.participations.push(event._id);
                                    user.save();
                                    return res.status(200).json({
                                        message     : "OK",
                                        data        : {
                                            event   : event,
                                            user    : user
                                        }
                                    });
                               }
                            });
                    }
                }
            });
    }
);

router.post('/',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["me", "adminGroup"]),
    function(req, res, next) {
        var event = new Events();
        for (var key in req.body) {
            if (key == "images") {
                for (var i = 0; i < req.body.images.length; ++i) {
                    var media = new Media();
                    media.relativePath = req.body.images[i];
                    media.author = req.user.id;
                    media.name = "[Events] " + req.body.name;
                    media.save();
                    event.images.push(media._id);
                }
            }
            else {
                console.log(key);
                event[key] = req.body[key];
            }
        }
        event.author = req.user.id;
        event.start_at = Date.now();
        event.end_at = Date.UTC(2016, 10, 26, 20, 20);
        event.save(function(err) {
            if (err)
                return next(err);
            else
                return res.status(200).json({
                    message : "OK",
                    data    : {
                        event: event
                    }
                });
        });
    }
);

module.exports = router;
