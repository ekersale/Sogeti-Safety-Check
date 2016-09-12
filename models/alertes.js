/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var alertesSchema = new Schema({
    name            : String,
    zone            : {
        latitude    : Number,
        longitude   : Number,
        perimeter   : { type: Number, default: 1 }
    },
    author          : { type: ObjectId, ref: "users"},
    message         : String,
    criticity       : { type: Number, min: 0, max: 10},
    site            : { type: ObjectId, ref: "location"},
    admin           : { type: ObjectId, ref: "groups"},
    start_at        : Date,
    end_at          : Date,
    created_at      : Date,
    updated_at      : Date
});

alertesSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var alertes = mongoose.model('alertes', alertesSchema);

module.exports = alertes;