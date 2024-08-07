const mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    dkimSelector: String,
    dkimPrivateKey: String,
    dkimPublicKey: String,
    spfRecord: String,
    mxRecord: {
        type: String,
        default: ''
    },
    aRecord: {
        type: String,
        default: ''
    },
    cnameRecord: {
        type: String,
        default: ''
    },
    // New fields for verification status of each record
    dkimVerified: {
        type: Boolean,
        default: false
    },
    spfVerified: {
        type: Boolean,
        default: false
    },
    mxVerified: {
        type: Boolean,
        default: false
    },
    aVerified: {
        type: Boolean,
        default: false
    },
    cnameVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const DomainModel = mongoose.model('Domain', DomainSchema);
module.exports = DomainModel;