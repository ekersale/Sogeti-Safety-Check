var express = require('express');
var router = express.Router();

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
router.get('/', function(req, res, next) {
  res.status(200).json({
    message : "online"
  });
  next();
});

module.exports = router;
