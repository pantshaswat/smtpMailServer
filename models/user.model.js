const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        unique: true
    },
    apiSecret: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailQuota: {
        type: Number,
        default: 1000 // Default monthly quota
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;