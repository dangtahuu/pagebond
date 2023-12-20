import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
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
    },
    code: {
      type: [String],  
      unique: true,    
      required: true   
    },
  },
  { timestamps: true }
);

export default mongoose.model("Voucher", voucherSchema);
