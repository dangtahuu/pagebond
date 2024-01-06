import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    name: {
      type: String
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  }
);

conversationSchema.virtual('content', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation'
});

export default mongoose.model("Conversation", conversationSchema);
