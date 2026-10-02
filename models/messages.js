const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, default: "sent" },
    is_edited: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Messages =
  mongoose.models.messages || mongoose.model("messages", messageSchema);

module.exports = Messages;

