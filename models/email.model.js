const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
        required: true
    },
    sender:{
        type: String,
        required: true
    },
    subject:{
        type: String
        },
    html:{
        type: String
    },
    content:{
        type: String,
    }
    },
 {
    timestamps: true
 }
);

const EmailModel = mongoose.model('emails',EmailSchema);

module.exports = EmailModel;