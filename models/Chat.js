const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ["private"],
    default: "private"
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
