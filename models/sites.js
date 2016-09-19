/**
 * Created by ekersale on 07/09/16.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var locationSchema = new Schema({
    name            : String,
    employeesNb     : { type: Number, min: 0},
    members         : [{ type: ObjectId, ref: "users"}],
    admin           : [{ type: ObjectId, ref: "users"}],
    created_at      : Date,
    updated_at      : Date
});

locationSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at)
        this.created_at = currentDate;
    next();
});

var location = mongoose.model('location', locationSchema);

module.exports = location;