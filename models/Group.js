const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  icon: { type: String, default: "💬" },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Group", groupSchema);
