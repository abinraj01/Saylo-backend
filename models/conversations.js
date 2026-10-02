const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user1_id: { type: String, required: true },
    user2_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
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

const Conversations =
  mongoose.models.conversations ||
  mongoose.model("conversations", conversationSchema);

module.exports = Conversations;

