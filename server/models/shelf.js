import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        books: [{type: mongoose.Types.ObjectId, ref: "Book"}],
        type: {
            type:Number,
            enum:[1,2],
            default: 2
        },
        owner: {
            type: mongoose.Types.ObjectId, ref: "User", required: true
        },
        
    },
    {timestamps: true}
);


export default mongoose.model("Shelf", shelfSchema);


