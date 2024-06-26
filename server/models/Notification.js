const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const notificationSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readyCheck: {
    type: Schema.Types.ObjectId,
    ref: 'ReadyCheck',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp)
  },
  read: {
    type: Boolean,
    default: false
  }
});

const Notification = model('Notifications', notificationSchema);
module.exports = Notification;
