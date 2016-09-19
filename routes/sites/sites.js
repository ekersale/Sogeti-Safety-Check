/**
 * Created by ekersale on 19/09/16.
 */


var express = require('express');
var router = express.Router();
var expressjwt = require("express-jwt");
var Promise = require('bluebird');

/*
 ** BD models requires --> mongodb
 */
var Sites = require("../../models/sites");


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
            Sites.find(query)
                .skip((req.query.page != undefined && req.query.page > 0 ) ? (req.query.page - 1) * limit : 0).limit(limit)
                .exec(),
            Sites.find(query).count().exec()
        ]).spread(function(sites, count) {
            res.status(200).json({ message : "OK", data : { count: count, sites: sites }});
        }, function(err) {
            return next(err);
        }).catch(function(err) {
            res.status(200).json({ message: "OK", data: { count: 0, site: []}, error: err})
        });
    }
);

module.exports = router;
