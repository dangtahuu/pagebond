import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
 
    book: {
        type: mongoose.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    progress: {
      type: Number,
      default: 999999
    }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
