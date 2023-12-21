import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: Number,
      enum: [1,2,3,4,5,6,7,8,9,10,11],
      required: true,
    },
    typeOfLink: {
        type: String,
        enum: ['User','Post', 'Trade','Review',"News","Question","Voucher"]
      },
    linkTo: { type: mongoose.Schema.Types.ObjectId},
    note: {
      type: String
    },
    isRead: { type: Boolean, default: false },
    points: {
        type:Number,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
