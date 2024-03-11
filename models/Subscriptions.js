const mongoose = require('mongoose');

const subscribedChannelSchema = mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chanelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Subscription", subscribedChannelSchema);