import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    owner: { type: mongoose.Types.ObjectId, ref: "User" },
    type: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      required: true,
    },
    isUsed: {
        type:Boolean,
        default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Voucher", voucherSchema);
