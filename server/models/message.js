import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: String,
    image: {
      url: String,
      public_id: String,
    },
    conversation: [{ type: mongoose.Types.ObjectId, ref: "Conversation", required: true }],
    readBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true
      },
    ],
    sentBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    deleteBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
