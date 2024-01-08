import mongoose from "mongoose";

const logTypeSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
    }
  },
);

export default mongoose.model("LogType", logTypeSchema);
