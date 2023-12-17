import mongoose from "mongoose";

const hashtagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        numberOfPosts:{
            type: Number,
            default:1
        }

    },
    {timestamps: true}
);

export default mongoose.model("Hashtag", hashtagSchema);


