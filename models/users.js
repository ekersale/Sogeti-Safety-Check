/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
    name            : {
        first       : String,
        last        : String
    },
    credentials     : {
        password    : String,
        token       : String
    },
    email           : String,
    phone           : String,
    function        : String,
    state           : String,
    living          : {
        latitude    : Number,
        longitude   : Number
    },
    geoloc          : {
        latitude    : Number,
        longitude   : Number
    },
    allowGeoloc     : { type: Boolean },
    location        : { type: ObjectId, ref: "location" },
    groups          : [{ type: ObjectId, ref: "groups"}],
    participations  : [{ type: ObjectId, ref: "events" }],
    events          : [{ type: ObjectId, ref: "events"}],
    profileImg      : { type: ObjectId, ref: "media" },
    contacts        : [{ type: ObjectId, ref: "users"}],
    chat            : [{ type: ObjectId, ref: "chat"}],
    created_at      : Date,
    updated_at      : Date
});

userSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});


var users = mongoose.model('users', userSchema);

module.exports = users;