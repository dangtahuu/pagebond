import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    googleBookId: {
      type: String,
    },
    description: {
      type: String,
    },
    genres: {
      type: [String],
    },
    publisher: {
      type: String,
    },
    publishedDate: {
      type: String,
    },
    previewLink: {
      type: String,
    },
    pageCount: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    content: {
      type: Number,
      default: 0,
    },
    development: {
      type: Number,
      default: 0,
    },
    pacing: {
      type: String,
      enum: ["Slow", "Medium", "Fast"],
    },
    writing: {
      type: Number,
      default: 0,
    },
    insights: {
      type: Number,
      default: 0,
    },
    numberOfRating: {
      type: Number,
      default: 0,
    },
    topShelves: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
