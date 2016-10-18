var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var jwt = require('jsonwebtoken');

var Users = require("../models/users");
var authHelper = require("../authHelper");
var CryptoJS = require('crypto-js');
var randomstring = require('randomstring');
var expressjwt = require("express-jwt");


var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'noreply.orh.sht@gmail.com',
        pass: 'Sogeti99#'
    }
}));

/**
 * @api {get} /status Request User information
 * @apiName GetStatus
 * @apiGroup Status
 *
 *
 * @apiSuccess {String} status        Specify if the API is active
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "online",
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *     }
 */
router.get('/', function(req, res) {
    res.status(200).json({
        status : "online"
    });
});


/**
 * @api {get} /authentication Request user authentication
 * @apiName GetAuthentication
 * @apiGroup Authentication
 *
 * @apiParam {String} token         Auto login token, no other credentials required
 * @apiParam {String} mobile        User mobile enter on his profile
 * @apiparam {String} email         User email enter on his profile
 * @apiParam {String} password      User password defined by himself
 *
 * @apiSuccess {String} message     Specify authentication succeeded
 * @apiSuccess {String} data.token  Authorization token
 * @apiSuccess {String} data.userID Authenticated user ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message"  : "User authenticated",
 *       "data"     : {
 *          "token" : "XCVBNDDFGHJ23457890.DHJejfoezjez145efzekjezljcc890086544cce7efezfefz7fezfez",
 *          "userID": "ef578fezpok123"
 *       }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad request
 *     {
 *        "error" : {
 *            "message" : "Credentials partially incorrect"
 *        }
 *     }
 *
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *        "error" : {
 *            "message" : "Authentication failed"
 *        }
 *     }
 */
router.get('/authentication',
    function(req, res, next) {
        if (req.query.token != undefined || ((req.query.email != undefined || req.query.phone != undefined)  && req.query.password != undefined))
            next();
        else return res.status(400).json({
            error : {
                message : "Credentials partially incorrect"
            }
        });
    },
    function(req, res, next) {
        var id = "";
        Users.findOne( { $or : [
                { email: req.query.email, 'credentials.password' : req.query.password},
                { phone: req.query.phone, 'credentials.password' : req.query.password },
                { token: req.query.token, _id: new ObjectId(id) }
            ]
            }
        ).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return res.status(401).json({
                    error: {
                        message   : "Authentication failed"
                    }
                });
                else {
                    var token = jwt.sign({id : user._id}, process.env.jwtSecretKey);
                    user.credentials.token = token;
                    user.save(function(err) {
                        if (err) return next(err);
                        res.status(200).json({
                            message :  "User authenticated",
                            data    : {
                                token : token,
                                userID: user._id
                            }
                        });
                    });
                }
            }
        );
    }
);

var outlook = require("node-outlook");

router.get("/oauth", function(req, res, next) {
    return res.status(200).json({
        message : "OK",
        data    : {
            url : authHelper.getAuthUrl()
        }
    });
});

router.get("/authorize",
    function(req, res, next) {
        var code = req.query.code;
        authHelper.getTokenFromCode(code, tokenReceived, res, next);
    }
);

function tokenReceived(res, token) {
    console.log("index.js - l.139");
    return res.status(200).json({
           message : "OK",
           data : {
               token: token
           }
       })
    }

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var Media = new require('../models/media');

router.post('/registration',
    function(req, res, next) {
        if (req.body.email != undefined &&
            validateEmail(req.body.email) == true &&
            req.body.email.indexOf("@sogeti.com") >= 0 &&
            req.body.password != undefined &&
            req.body.password.length >= 8)
            return next();
        else
            return next(req.app.getError(400, "Bad request", { state: "Missing or incorrect parameters"}))
    }, function(req, res, next) {
        var user = new Users();
        user.credentials.password = CryptoJS.SHA256(req.body.password).toString();
        user.email = req.body.email;
        var media = new Media();
        media.name = "imageProfile";
        media.absolutePath = "";
        media.relativePath = "https://case.edu/medicine/admissions/media/school-of-medicine/admissions/classprofile.png";
        media.author = user._id;
        media.save();
        user.profileImg = media._id;
        user.save(function(err){
            if (err) return next(err);
            else return res.status(200).json({
                message     : "User successfully registered",
                data        : {
                    token   : jwt.sign({id: user._id}, process.env.jwtSecretKey),
                    userID  : user._id
                }
            });
        });
    }
);

router.get("/recoverPwd",
    function(req, res, next) {
        if (req.query.email == undefined || req.query.email == "")
            return next(req.app.getError(400, "Incorrect or missing parameter 'email'"));
        else
            Users.findOne({email: req.query.email})
                .exec(function(err, user) {
                    if(err) return next(err);
                    else if (!user) return next(req.app.getError(404, "User not found. Please verify email address"));
                    else {
                        var pwd =  randomstring.generate(10);
                        user.credentials.password = CryptoJS.MD5(CryptoJS.SHA256(pwd));
                        user.save();
                        var mailOptions = {
                            from: '"noreply-sogeti" <noreply@sogeti.com>"',
                            to  : user.email,
                            subject : 'Password reset',
                            html: '<p>Hi ' + user.name.first + " !</p><br/><br/>" +
                                "<p>It appear you asked for a new password. Please find the new password above: </p><br />" +
                                "<p><b>" + pwd + "</b></p><br />" +
                                "<p>Please change this default password and take care to remember your credentials next time !</p><br /><br />" +
                                "<p><i>Best regards</i></p>"

                        };
                        transporter.sendMail(mailOptions, function(err, info) {
                            if (err) return next(err);
                            else res.status(200).json({
                                message     : info.response
                            });
                        });
                        return ;
                    }
                })
    }
);

router.get('/session',
    function(req, res, next) {
        if (req.query.email == undefined || req.query.password == undefined)
            return next(req.app.getError(400, "Bad request", {state: "Missing or incorrect parameters"}));
        else
            return next();
    }, function(req, res, next) {
        Users.findOne({"email": req.query.email, "credentials.password": CryptoJS.SHA256(req.query.password).toString()})
            .exec(function(err, user) {
                if (err) return next(err);
                else if (user == null || user == undefined){
                    return next(req.app.getError(401, "Bad credentials", {state: "Incorrect credentials"}));
                }
                else return res.status(200).json({
                        message     : "User authenticated",
                        data        : {
                            token   : jwt.sign({id: user._id}, process.env.jwtSecretKey),
                            userID  : user._id
                        }
                    });
            });
    }
);

router.get('/isUserAuth',
    expressjwt({secret: process.env.jwtSecretKey}),
    function(req, res, next) {
        Users.findOne({_id : req.user.id})
            .exec(function(err, user) {
                if (err) return next(err);
                else if (!user) return next(req.app.getError(404, 'User not found'));
                else return res.status(200).json({
                        message: "OK",
                        data    : {
                            user: user
                        }
                    });
            });
    }
);


module.exports = router;
