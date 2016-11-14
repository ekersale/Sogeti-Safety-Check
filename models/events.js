/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var eventsSchema = new Schema({
    name            : {type: String, required: true, default: ""},
    zone            : {
        latitude    : Number,
        longitude   : Number
    },
    participants    : [{ type: ObjectId, ref: "users" }],
    author          : { type: ObjectId, ref: "users"},
    message         : String,
    images          : [{ type: ObjectId, ref: "media"}],
    admin           : { type: ObjectId, ref: "groups"},
    target          : [{type: ObjectId, ref: "groups"}],
    comments        : [{type: ObjectId, ref:"comments"}],
    type            : {type:Number, min: 0, max: 1, required: true},
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