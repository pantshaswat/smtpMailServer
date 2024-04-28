const mongoose = require('mongoose');

const EmailSchema = new Mongoose.Schema({
    recipient:{
        type: mongoose.Schema.type.ObjectId,
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
    dateTime:{
        type: String
    },
    content:{
        type: String,
    }
    }
)