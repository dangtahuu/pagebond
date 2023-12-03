import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: Number,
      required: true,
    },
    development: {
      type: Number,
      required: true,
    },
    pacing: {
      type: Number,
      required: true,
    },
    writing: {
      type: Number,
      required: true,
    },
    insights: {
      type: Number,
      required: true,
    },
    dateRead: {
      type: Date,
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
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
