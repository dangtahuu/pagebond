import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
    },
    type: {type: Number, enum: [1,2], required: true}
  },
  { timestamps: true }
);

export default mongoose.model("Prompt", promptSchema);
