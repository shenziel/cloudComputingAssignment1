var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArchivesSchema = new Schema({
    name : String,
    description : String,
    imageUrl : String
});

module.exports = mongoose.model('archives', ArchivesSchema);