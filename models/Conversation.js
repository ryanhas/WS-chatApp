const mongoose = require('mongoose')

const ConversationSchema = new mongoose.Schema({
  person1: {
    type: String,
    required: true,
  },
  person2: {
    type: String,
    required: true,
  },
  messages: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Conversation', ConversationSchema)