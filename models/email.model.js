const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    domain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domain',
        required: true
    },
    subject: {
        type: String
    },
    html: {
        type: String
    },
    content: {
        type: String
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'spam'],
        default: 'sent'
    },
    openedAt: Date,
    clickedAt: Date
}, {
    timestamps: true
});

const EmailModel = mongoose.model('Email', EmailSchema);
module.exports = EmailModel;