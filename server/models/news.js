import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
    },
 
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);
