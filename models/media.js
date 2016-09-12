/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var mediaSchema = new Schema({
    name            : String,
    absolutePath    : String,
    relativePath    : String,
    author          : { type: ObjectId, ref: "users"},
    created_at      : Date,
    updated_at      : Date
});

mediaSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var media = mongoose.model('media', mediaSchema);

module.exports = media;