/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Users = require('./users');

var chatSchema = new Schema({
    name            : String,
    participants    : [{ type: ObjectId, ref: "users" }],
    history         : [{
        author      : {type: ObjectId, ref: "users"},
        date        : Date,
        message     : String
    }],
    admin           : { type: ObjectId, ref: "users"},
    created_at      : Date,
    updated_at      : Date
});

chatSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (this.isNew) {
        var that = this;
        for (var i = 0; i < this.participants.length; ++i) {
            Users.findOne({_id: that.participants[i]})
                .exec(function(err, user) {
                    if (err) return;
                    else if (!user) return;
                    else {
                        user.chat.push(that._id);
                        user.save();
                    }
                });
        }
    }
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var chat = mongoose.model('chat', chatSchema);

module.exports = chat;