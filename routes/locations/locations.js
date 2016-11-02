/**
 * Created by ekersale on 25/10/2016.
 */

var express = require('express');
var router = express.Router();
var GoogleLocations = require('google-locations');
var locations = new GoogleLocations('AIzaSyBtI1hW2w4apiZMjb-HLWWOy6nsw3KWWRY');

router.get('/search', function(req, res, next) {
    if (!req.query["q"])
       return next(req.app.getError(400, "Bad request"));
    locations.autocomplete({input: req.query.q, language: 'fr'}, function(err, response) {
        if (err) return next(err);
        else return res.status(200).json({
            message : "OK",
            data    : {
                predictions : response.predictions
            }
        });
    });
});

module.exports = router;
