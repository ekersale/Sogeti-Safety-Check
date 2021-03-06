/**
 * Created by ekersale on 11/10/2016.
 */

var express = require('express');
var router = express.Router();
var expressjwt = require("express-jwt");
var permissions = require("../../permissions");
var Promise = require('bluebird');
var Events = require('../../models/events');
var Media = require('../../models/media');
var User = require('../../models/users');
var Groups = require('../../models/groupes');
var shortid = require('shortid');
var Comments = require('../../models/comments');

var gcmApiKey = 'AIzaSyBQnYq835Gdnsz4lb5qX5v8EseRhrxOZNQ'; // GCM API KEY OF YOUR GOOGLE CONSOLE PROJECT
var FCM = require("fcm-node");

var GoogleLocations = require('google-locations');
var locations = new GoogleLocations('AIzaSyBtI1hW2w4apiZMjb-HLWWOy6nsw3KWWRY');

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
            req.query.q = decodeURI(req.query.q);
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

router.get('/:id/participants',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Events.findOne({_id : req.params.id})
            .populate([
                { path: 'participants', model: 'users', select: 'name profileImg _id',
                    populate : { path: 'profileImg', model: 'media', select: 'relativePath -_id' }
                }
            ])
            .exec(function(err, event) {
                if (err) return next(err);
                else if (!event) return next(req.app.getError(404, "Event not found"));
                else return res.status(200).json({
                        message     :'OK',
                        data        : {
                            participants: event.participants
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
                                    event.save(function(err) {
                                        if (err) return next(err);
                                        else {
                                            user.participations.push(event._id);
                                            user.save();
                                            Events.findOne({_id: req.params.id})
                                                .populate([
                                                    {
                                                        path: "images", model: "media", select: "relativePath -_id"
                                                    },
                                                    {
                                                        path: "participants", model: "users", select: "name id profileImg",
                                                        populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
                                                    },
                                                    {
                                                        path: "author", model: "users", select: "name id profileImg",
                                                        populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
                                                    }
                                                ])
                                                .exec(function(err, event) {
                                                    if (err) return next(err);
                                                    else if (!event) return next(req.app.getError(404, "Event not found"));
                                                    else return res.status(200).json({
                                                            message     : "OK",
                                                            data        : {
                                                                event   : event,
                                                                user    : user
                                                            }
                                                        });
                                                });
                                        }
                                    });
                                }
                            });
                    }
                }
            });
    }
);


router.delete('/:id/subscribe',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function (req, res, next) {
        Events.findOne({_id: req.params.id, participants: req.user.id})
            .exec(function(err, event) {
                if (err) return next(err);
                else if (!event) return next(req.app.getError(409, "User not participating"));
                else {
                    event.participants.splice(event.participants.indexOf(req.user.id), 1);
                    User.findOne({_id: req.user.id})
                        .exec(function(err, user) {
                            if (err) return next(err);
                            else if(!user) return next(req.app.getError(404, "User not found"));
                            else {
                                user.participations.splice(user.participations.indexOf(req.params.id), 1);
                                user.save(function(err) {
                                    if (err) return next(err);
                                    else {
                                        event.save(function(err) {
                                            if (err) return next(err);
                                            else Events.findOne({_id: req.params.id})
                                                .populate([
                                                    {
                                                        path: "images", model: "media", select: "relativePath -_id"
                                                    },
                                                    {
                                                        path: "participants", model: "users", select: "name id profileImg",
                                                        populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
                                                    },
                                                    {
                                                        path: "author", model: "users", select: "name id profileImg",
                                                        populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
                                                    }
                                                ])
                                                .exec(function(err, event) {
                                                    if (err) return next(err);
                                                    else if (!event) return next(req.app.getError(404, "Event not found"));
                                                    else {
                                                        return res.status(200).json({
                                                            message     : "OK",
                                                            data        : {
                                                                event   : event
                                                            }
                                                        })
                                                    }
                                                });
                                        });
                                    }
                                });
                            }
                        });
                }
            });

        /*        Events.findOne({_id: req.params.id})
         .exec(function(err, event) {
         if (err) return next(err);
         else if (!event) return next(req.app.getError(404, "Event not found"));
         else {
         if (event.participants.indexOf(req.user.id) == 1)
         return next(req.app.getError(409, "User not participating to this event"));
         else {
         User.findOne({_id: req.user.id})
         .exec(function(err, user) {
         if (err) return next(err);
         else if (!user) return next(req.app.getError(404, "User not found"));
         else {
         user.participations.splice(user.participations.indexOf(req.params.id), 1);
         user.save(function(err) {
         if (err) return next(err);
         });
         event.participants.splice(event.participants.indexOf(req.user.id), 1);
         event.save(function(err) {
         if (err) return next(err);
         });
         Events.findOne({_id: req.params.id})
         .populate([
         {
         path: "images", model: "media", select: "relativePath -_id"
         },
         {
         path: "participants", model: "users", select: "name id profileImg",
         populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
         },
         {
         path: "author", model: "users", select: "name id profileImg",
         populate : { path: 'profileImg', model: "media", select: "relativePath -_id" }
         }
         ])
         .exec(function(err, event) {
         if (err) return next(err);
         else if (!event) return next(req.app.getError(404, "Event not found"));
         else return res.status(200).json({
         message     : "OK",
         data        : {
         event   : event
         }
         });
         });
         }
         });
         }
         }
         });*/
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
        event.type = 0;
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

router.get('/:id/comments',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Events.findOne({_id: req.params.id})
            .populate([
                {
                    path: "comments", model: "comments",
                    populate : { path: 'author', model: "users", select: "profileImg _id name",
                        populate : { path: 'profileImg', model: 'media', select: 'relativePath -_id'}}
                }
            ])
            .exec(function(err, event) {
                console.log(event);
                if (err) return next(err);
                else {
                    return res.status(200).json({
                        message     : "OK",
                        data        : {
                            event   : event,
                            comments: event.comments
                        }
                    });
                }
            });
    }
);

router.post('/:id/comments',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        if (!req.body.message || req.body.message == "")
            return next(req.app.getError(400, "Param @message empty or not found"));
        Events.findOne({_id: req.params.id}, function(err, event) {
            if (err) return next(err);
            else if (!event) return next(req.app.getError(404, "Event not found"));
            else {
                var comment = new Comments();
                comment.author = req.user.id;
                comment.message = req.body.message;
                comment.save(function(err) {
                    if (err) return next(err);
                });
                event.comments.push(comment._id);
                event.save(function(err) {
                    if (err) return next(err);
                    else {
                        Comments.findOne({_id: comment._id})
                            .populate([
                                {
                                    path: 'author', model: "users", select: "profileImg _id name",
                                    populate : { path: 'profileImg', model: 'media', select: 'relativePath -_id'}
                                }
                            ])
                            .exec(function(err, cmt) {
                                if (err)
                                    return next(err);
                                else
                                    return res.status(200).json({
                                        message     : "OK",
                                        data        : {
                                            comment : cmt
                                        }
                                    });
                            });
                    }
                })
            }
        });
    }
);

router.put('/:id/comments/:comment',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        if (!req.body.message || req.body.message == "")
            return next(req.app.getError(400, "Param @message empty or not found"));
        Events.findOne({_id: req.params.id}, function(err, event) {
            if (err) return next(err);
            else if (!event) return next(req.app.getError(404, "Event not found"));
            else {
                Comments.findOne({_id: req.params.comment}, function(err, comment) {
                    if (err) return next(err);
                    else if (!comment) return next(req.app.getError(400, "Comment not found"));
                    else if (comment.author != req.user.id) return next(req.app.getError(401, "Unauthorized action"));
                    else {
                        comment.message = req.body.message;
                        comment.save(function(err) {
                            if (err) return next(err);
                            else res.status(200).json({
                                message     : "OK",
                                data        : {
                                    event   : event,
                                    comment : comment
                                }
                            });
                        });
                    }
                });
            }
        });
    }
);

router.delete('/:id/comments/:comment',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Events.findOne({_id: req.params.id}, function(err, event) {
            if (err) return next(err);
            else if (!event) return next(req.app.getError(404, "Event not found"));
            else if (event.author != req.user.id) return next(req.app.getError(401, "Unauthorized action"));
            else {
                var index = event.comments.indexOf(req.params.comment);
                if (index != -1)
                    event.comments.splice(index, 1);
                event.save(function(err) {
                    if (err)
                        return next(err);
                });
                Comments.findOneAndRemove({_id: req.params.comment},function(err) {
                    if (err)
                        return next(err);
                    else return res.status(200).json({
                        message     : "OK",
                        data        : {
                            event   : event
                        }
                    });
                });
            }
        });
    }
);

router.post("/alerts",
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        if (req.body.groups == undefined || req.body.groups.length == 0)
            return next(req.app.getError(400, "Missing parameter groups:[]"));
        if (req.body.title == undefined || req.body.title == "")
            return next(req.app.getError(400, "Missing parameter title:string"));
        if (req.body.message == undefined || req.body.message == "")
            return next(req.app.getError(400, "Missing parameter message:string"));
        if (req.body.place == undefined || req.body.place.id == "")
            return next(req.app.getError(400, "Missing parameter place:{}"));
        if (req.body.date == undefined) {
            req.body.date = Date.now();
        }
        next();
    },
    function(req, res, next) {
        getGoogleImg(req.body.place, req, next);
    },
    function(req, res, next) {
        var event = new Events();
        event.author = req.user.id;
        event.name = req.body.title;
        event.message = req.body.message;
        var media = new Media();
        media.relativePath = req.body.place.image;
        media.name = "[Alert] " + req.body.title;
        media.author = req.user.id;
        media.save(function(err) {
            if (err) return next(err);
        });
        event.images.push(media._id);
        event.type = 1;
        event.zone = req.body.zone;
        event.target = req.body.groups;
        event.start_at = req.body.date;
        event.save(function(err) {
            console.log(err);
            if (err) return next(err);
            else res.status(200).json({
                message     : "OK"
            });
        })
    }
);

function getGoogleImg(place, req, next) {
    locations.details({placeid: place.place.place_id}, function(err, response) {
        if (err) return next(err);
        else {
            var urlEncoded = GMapCircle(response.result.geometry.location.lat, response.result.geometry.location.lng, (place.perimeterValue == undefined) ? 0 : place.perimeterValue);
            var MapFill   = 'E85F0E';    // fill colour of our circle
            var MapBorder = '91A93A';    // border colour of our circle
            var MapWidth  = 640;         // map image width (max 640px)
            var MapHeight = 480;

            var url = "https://maps.googleapis.com/maps/api/staticmap?" + 'center=' + response.result.geometry.location.lat +
                ',' + response.result.geometry.location.lng + '&size=' + MapWidth + 'x' + MapHeight + '&maptype=roadmap&path=fillcolor:0x' +
                MapFill + '33%7Ccolor:0x' + MapBorder + '00%7Cenc:' + urlEncoded + '&sensor=false';
            req.body.place.image = url;
            req.body.zone= {};
            req.body.zone.longitude = response.result.geometry.location.lng;
            req.body.zone.latitude = response.result.geometry.location.lat;
            next();
        }
    });
}

var polyline = require("polyline");

function GMapCircle(latitude,longitude, radius) {
    var R   = 6371;
    var Detail = 8;
    var pi  = Math.PI;

    var Lat  = (latitude * pi) / 180;
    var Lng  = (longitude * pi) / 180;
    var d    = radius / R;

    var points = [];
    for(var i = 0; i <= 360; i+=Detail){
        var brng = i * pi / 180;
        var pLat = Math.asin(Math.sin(Lat)*Math.cos(d) + Math.cos(Lat)*Math.sin(d)*Math.cos(brng));
        var pLng = ((Lng + Math.atan2(Math.sin(brng)*Math.sin(d)*Math.cos(Lat), Math.cos(d)-Math.sin(Lat)*Math.sin(pLat))) * 180) / pi;
        pLat = (pLat * 180) / pi;
        points.push([pLat,pLng]);
    }
    return polyline.encode(points);
}

module.exports = router;
