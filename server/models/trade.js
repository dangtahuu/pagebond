import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
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
      type: String,
      required: true,
      enum: ["New","Like new", "Good", "Worn", "Bad"]
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true
    },
  },
  { timestamps: true }
);

tradeSchema.index({ location: "2dsphere" });

export default mongoose.model("Trade", tradeSchema);
