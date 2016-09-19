var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var jwt = require('jsonwebtoken');

var Users = require("../models/users");
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
              { email: req.body.email, 'credentials.password' : req.body.password},
              { phone: req.body.phone, 'credentials.password' : req.body.password },
              { token: req.body.token, _id: new ObjectId(id) }
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



module.exports = router;
