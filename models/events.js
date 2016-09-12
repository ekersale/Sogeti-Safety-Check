/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var eventsSchema = new Schema({
    name            : String,
    zone            : {
        latitude    : Number,
        longitude   : Number,
    },
    participants    : [{ type: ObjectId, ref: "users" }],
    author          : { type: ObjectId, ref: "users"},
    message         : String,
    images          : [{ type: ObjectId, ref: "media"}],
    admin           : { type: ObjectId, ref: "groups"},
    start_at        : Date,
    end_at          : Date,
    created_at      : Date,
    updated_at      : Date
});

eventsSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var events = mongoose.model('events', eventsSchema);

module.exports = events;