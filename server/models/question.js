import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,

    },
    book: {
        type: mongoose.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      url: {
        type: String,
      },
      public_id: String,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        image: {
          url: String,
          public_id: String,
          default: {
            url: "",
            public_id: "",
          },
        },
        created: {
          type: Date,
          default: Date.now,
        },
        postedBy: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    reported: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
