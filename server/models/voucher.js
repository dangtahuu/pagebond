import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: [String],  // Array of strings
      unique: true,    // Ensures that all values in the array are unique
      required: true   // Makes the field required
    },
    name: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: String
    },
    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Voucher", voucherSchema);
