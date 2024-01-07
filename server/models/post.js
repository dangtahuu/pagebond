import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
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
      url: String,
      public_id: String,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User", unique: true }],
    saved: [
      {
        created: {
          type: Date,
          default: Date.now,
        },
        savedBy: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    comments: [
      {
        text: String,
        image: {
          url: String,
          public_id: String,
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
    hashtag: [{ type: mongoose.Types.ObjectId, ref: "Hashtag" }],
    postType: {
      type: String,
      required: true,
      default:"Post",
      enum: ['Post', 'Review','Trade','Question','News']
    },
    detail: {
      type: mongoose.Types.ObjectId,
      refPath: 'postType'
    },
    spoiler: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
