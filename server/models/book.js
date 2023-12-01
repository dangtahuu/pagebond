import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
        },
        code: {
            type: String,
        }
    },
    {timestamps: true}
);


export default mongoose.model("Book", bookSchema);


