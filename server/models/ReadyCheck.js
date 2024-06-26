const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

// Define the formatting function
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
  const ampm = hours >= 12 ? 'pm' : 'am'; // Determine am/pm
  const formattedHours = (hours % 12) || 12; // Convert 24-hour to 12-hour format

  // Create the formatted string
  const formattedTime = `${formattedHours}:${minutes}${ampm}`;
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
  
  return `${formattedTime}, ${formattedDate}`;
};

// Define the chat message schema
const chatMessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    get: formatTimestamp, // Use the formatting function directly
  },
});

// Define the ready check schema
const readyCheckSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
    trim: true,
  },
  activity: {
    type: String,
    trim: true,
  },
  timing: {
    type: Date,
    required: true,
    get: (timestamp) => dateFormat(timestamp),
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
  invitees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }],
  RSVPs: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reply: {
      type: String,
      enum: ['Ready', 'Declined', 'Maybe', 'Pending'],
      default: 'Pending',
    },
  }],
  chatMessages: [chatMessageSchema],
});

const ReadyCheck = model('ReadyCheck', readyCheckSchema);

module.exports = ReadyCheck;
