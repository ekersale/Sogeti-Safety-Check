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
var Groups = require('../../models/groupes');
var shortid = require('shortid');

var gcmApiKey = 'AIzaSyBQnYq835Gdnsz4lb5qX5v8EseRhrxOZNQ'; // GCM API KEY OF YOUR GOOGLE CONSOLE PROJECT
var FCM = require("fcm-node");

router.post('/push',
    expressjwt({ secret: process.env.jwtSecretKey}),
/*
    permissions(["adminGroup"]),
*/
    function(req, res, next) {
        if (req.body.groups == undefined || req.body.groups.length == 0)
            return next(req.app.getError(400, "Missing parameter groups:[]"));
        if (req.body.title == undefined || req.body.title == "")
            return next(req.app.getError(400, "Missing parameter title:string"));
        if (req.body.message == undefined || req.body.message == "")
            return next(req.app.getError(400, "Missing parameter message:string"));
        next();
    },
    function(req, res, next) {
        var fcm = new FCM(gcmApiKey);
        for (var groupID in req.body.groups) {
            console.log(groupID);
            Groups.findOne({_id: req.body.groups[groupID]}, function(err, group) {
                if (err || !group)
                    return;
                else {
                    for (var userID in group.members) {
                        User.findOne({_id: group.members[userID]}, function(err, user) {
                            if (err || !user || user.pushNotificationToken == "" || user.notify.accept == false) return;
                            else {
                                console.log("test");
                                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                    to: user.notify.token,
                                    notification: {
                                        title: req.body.title,
                                        body: req.body.message
                                    },
                                    data: {  //you can send only notification or only data(or include both)
                                        'title': req.body.title,
                                        'message': req.body.message,
                                        'referTo': req.body.referTo
                                    }
                                };
                                fcm.send(message, function(err){
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                });
                            }
                        });
                    }
                }

            });
        }
        return res.status(200).json({
            message: "Notifications send"
        });
    }
);


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
                .sort('-created_at')
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
            if (key == "images" && req.body[key] != "") {
                for (var i = 0; i < req.body.images.length; i++) {
                    var media = new Media();
                    var filename = shortid.generate();
                    media.name = "[Events] " + req.body.title;
                    media.absolutePath = '/home/Sogeti/uploads/events/images/' + filename;
                    media.relativePath = 'http://198.27.65.200:3000/uploads/events/images/' + filename;
                    media.author = req.user.id;
                    media.save(function(err) {
                        console.log(err);
                        if (err) return next(err);
                    });
                    var base64Data = req.body.images[i].replace(/^data:image\/\w+;base64,/, "");
                    event.images.push(media._id);
                    require("fs").writeFile(media.absolutePath, base64Data, 'base64', function (err) {
                        if (err) event.images.pop();
                    });
                }
            }
            else {
                if (key == "start_at" || key =="end_at")
                    req.body[key] = Date.parse(req.body[key]);
                event[key] = req.body[key];
            }
        }
        event.author = req.user.id;
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
