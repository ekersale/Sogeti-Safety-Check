/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var chat = mongoose.model('chat', chatSchema);

module.exports = chat;