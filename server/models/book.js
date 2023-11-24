import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        author: {
            type: String,
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


