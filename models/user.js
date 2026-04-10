


const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema= new Schema({
  email:{
    type: String,
    required:true
  }
});

// passportLocalMongoose  created username & Password by default as no need ot create it by users.

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
