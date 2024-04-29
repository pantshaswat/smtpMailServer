const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
    }
});

const UserModel = mongoose.model('user',UserSchema);
module.exports = UserModel;