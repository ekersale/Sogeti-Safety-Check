/**
 * Created by ekersale on 07/11/2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var commentsSchema = new Schema({
    author          : { type: ObjectId, ref: "users"},
    message         : String,
    created_at      : Date,
    updated_at      : Date
});

commentsSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var comments = mongoose.model('comments', commentsSchema);

module.exports = comments;