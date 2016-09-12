/**
 * Created by ekersale on 07/09/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var groupsSchema = new Schema({
    name            : String,
    members         : [{ type: ObjectId, ref: "users"}],
    admin           : [{ type: ObjectId, ref: "users"}]
});

var groups = mongoose.model('groups', groupsSchema);

module.exports = groups;