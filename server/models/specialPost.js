import mongoose from "mongoose";

const specialPostSchema = new mongoose.Schema(
  {
    text: {
      type: String,
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
    type: {
        type: Number,
        required: true,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
    },
    hashtag: [{ type: mongoose.Types.ObjectId, ref: "Hashtag" }],
    spoiler: { type: Boolean, default: false },
    reported: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("SpecialPost", specialPostSchema);
