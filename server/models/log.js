import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogType",
      required: true,
    },
    typeOfLink: {
      type: String,
      enum: ["User", "Post", "Voucher", "Book"],
    },
    linkTo: { type: mongoose.Schema.Types.ObjectId, refPath: "typeOfLink" },
    note: {
      type: String,
    },
    isDone: { type: Boolean, default: false },
    points: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
