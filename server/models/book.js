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
        },
        description: {
            type: String,
        },
        genres: {
            type: [String]
        },
        publisher: {
            type: String,
        },
        publishedDate: {
            type: String,
        },
        previewLink: {
            type: String,
        },
        pageCount: {
            type: Number,
        },

    },
    {timestamps: true}
);


export default mongoose.model("Book", bookSchema);


