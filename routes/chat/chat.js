/**
 * Created by ekersale on 24/01/2017.
 */

var express = require('express');
var router = express.Router();
var expressjwt = require("express-jwt");
var permissions = require("../../permissions");

var Chats = require('../../models/chat');
var Users = require('../../models/users');

router.get('/',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Chats.find({participants: req.user.id}, {'history': {'$slice': -1}, participants: 1, name: 1})
            .populate([
                {
                    path:"participants",  model: "users", select: 'profileImg name email', populate:
                    { path: "profileImg", model: "media", select: "relativePath -_id"}
                }
            ])
            .populate('history.author')
            .sort({ 'history.date':  -1 })
            .exec(function(err, talks) {
            if (err) return next(err);
            else return res.status(200).json({
                message     : 'OK',
                data        : {
                    talks   : talks
                }
            });
        });
    }
);

router.get('/:chatID',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        Chats.findOne({_id: req.params.chatID})
            .populate([
                { path: 'history.author', model: "users", select: "profileImg", populate:
                    { path: 'profileImg', model:'media', select: 'relativePath -_id' }
                }
            ])
            .populate([
                { path:"participants",  model: "users", select: 'profileImg name email phone' }
            ])
            .exec(function(err, talk) {
                if (err) return next(err);
                else if (!talk) return next(req.app.getError(404, "Conversation not found"));
                else return res.status(200).json({
                        message     : "OK",
                        data        : {
                            talk    : talk
                        }
                    });
            });
    }
);

router.post('/',
    expressjwt({ secret: process.env.jwtSecretKey}),
    permissions(["logged"]),
    function(req, res, next) {
        var newChat = new Chats();
        Users.findOne({_id: req.body.contact._id}, function(err, user) {
            if (err) return next(err);
            else if (!user) return next(req.app.getError(404,'User not found'));
            else {
                newChat.name = user.name.first + " " + user.name.last;
                newChat.participants.push(req.user.id);
                newChat.participants.push(user._id);
                newChat.save(function(err) {
                    if (err) return next(err);
                    else {
                        Chats.findOne({_id: newChat._id})
                            .populate([
                                { path: 'history.author', model: "users", select: "profileImg", populate:
                                { path: 'profileImg', model:'media', select: 'relativePath -_id' }
                                }
                            ])
                            .populate([
                                { path:"participants",  model: "users", select: 'profileImg name email phone' }
                            ])
                            .exec(function(err, talk) {
                                if (err) return next(err);
                                else if (!talk) return next(req.app.getError(404, "Conversation not found"));
                                else return res.status(200).json({
                                        message     : "OK",
                                        data        : {
                                            talk    : talk
                                        }
                                    });
                            });
                    }
                });
            }
        });
    }
);

module.exports = router;
