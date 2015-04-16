var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
var UserSchema = new mongoose.Schema({
  NuweId: String
});

UserSchema.plugin(findOrCreate);

// define our simple user model
module.exports = mongoose.model('User', UserSchema);