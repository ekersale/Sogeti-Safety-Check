/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dangersSchema = new Schema({
    name            : String,
    criticity       : { type: Number, min: 0, max: 10},
    created_at      : Date,
    updated_at      : Date
});

dangersSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var dangers = mongoose.model('dangers', dangersSchema);

module.exports = dangers;