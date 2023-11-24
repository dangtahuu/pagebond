import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    type: {
      type: Number,
    },
    location: {
      type: {
        type: String,
      },
      coordinates: {
        type: [Number],
      },
    },
    address: {
      type: String,
    },
    rating: {
      type: Number,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
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
    },
  },
  { timestamps: true }
);

postSchema.index({ location: "2dsphere" });

export default mongoose.model("Post", postSchema);
