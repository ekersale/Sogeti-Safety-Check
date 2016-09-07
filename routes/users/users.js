var express = require('express');
var router = express.Router();


/**
 * @api {get} /users Request User information
 * @apiName GetUsers
 * @apiGroup Users
 *
 *
 * @apiSuccess {ObjectID} data.id           User reference
 * @apiSuccess {String} data.name           User name
 * @apiSuccess {String} data.firstname      User firstname
 * @apiSuccess {Number} data.phone          User phone number
 * @apiSuccess {String} data.function       User function in the company
 * @apiSuccess {String} data.state          User activity
 * @apiSuccess {String} data.home           User living place
 * @apiSuccess {Boolean} data.geoloc        User choice regarding geolocalization authorization
 * @apiSuccess {ObjectID} data.site         User place of work -> refer to a site model
 * @apiSuccess {ObjectID} data.events       User events -> refer to an array of event model
 * @apiSuccess {ObjectID} data.profileImg   User profile image -> refer to media model
 * @apiSuccess {ObjectID} data.contacts     User favorites contacts -> refer to an array of user model
 * @apiSuccess {ObjectID} data.permission   User permissions -> refer to permission model
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "OK",
 *       "data": {
 *          "id"        :  "1234FSOS344",
 *          "name"      : "John",
 *          "firstname" : "Doe",
 *          "phone"     : "0698123456",
 *          "function"  : "Developper",
 *          "state"     : "working",
 *          "home"      : "Antibes",
 *          "géolocal"  : true,
 *          "site"      : {
 *            "id"      : "ref site",
 *              //...
 *          },
 *          "events"    : [{
 *            "id"      : "ref events",
 *            //...
 *          }],
 *         "profileImg" : {
 *              "id"    : "ref media"
 *               //...
 *          }
 *          "contacts"  : [{
 *              "id"    : "ref User",
 *          }],
 *         "permission" : {
 *              "id"    : "ref permissions"
 *          }
 *      }
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 4xx Not Found
 *     {
 *       "error"        : "User not found",
 *       "stacktrace"   : {}
 *     }
 */
router.get('/', function(req, res, next) {
  next();
});


/**
 * @api {get} /users Request User information
 * @apiName GetUsers
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
