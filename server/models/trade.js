import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'], 
      required: true
      },
      coordinates: {
        type: [Number],
        required: true

      },
    },
    address: {
      type: String,
      required: true
    },
    condition: {
      type: Number,
      required: true,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true
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
  },
  { timestamps: true }
);

tradeSchema.index({ location: "2dsphere" });

export default mongoose.model("Trade", tradeSchema);
