/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
    name            : {
        first       : {type: String, default: ''},
        last        : {type: String, default: ''}
    },
    credentials     : {
        password    : String,
        token       : String
    },
    email           : {type: String, unique: true},
    phone           : {type: String, default: ''},
    function        : {type: String, default: ''},
    state           : {type: String, default: ''},
    notify          : {
        accept      : {type: Boolean, default: true},
        token       : {type: String, default: ''}
    },
    living          : {
        latitude    : {type: Number, default: 0},
        longitude   : {type: Number, default: 0}
    },
    geoloc          : {
        latitude    : {type: Number, default: 0},
        longitude   : {type: Number, default: 0}
    },
    allowGeoloc     : { type: Boolean, default: true },
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

userSchema.pre('remove', function(next) {
    // Remove all the assignment docs that reference the removed person.
    // this.model('Assignment').remove({ person: this._id }, next);
});


var users = mongoose.model('users', userSchema);

module.exports = users;