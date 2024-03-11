const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String
    },
    desc: {
        type: String
    },
    password: {
        type: String,
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    blocked: {
        type: Boolean,
        default: false
    },
    joinedOn: { type: Date, default: Date.now },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber' }], 
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }] 
},
    {
        timestamps: true
    });

module.exports = mongoose.model("User", userSchema);
