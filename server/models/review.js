import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: Number,
      required: true,
    },
    development: {
      type: Number,
      required: true,
    },
    pacing: {
      type: String,
      enum: ["Slow","Medium","Fast"],
      required: true,
    },
    writing: {
      type: Number,
      required: true,
    },
    insights: {
      type: Number,
      required: true,
    },
    dateRead: {
      type: Date,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true,
    },
  },
  { timestamps: true }
);


// reviewSchema.pre("save", function (next) {
//   this.popularity = this.likes.length+this.comments.length;
//   next()
// });

reviewSchema.pre('updateOne', function(next) {
  // Access the query and update operations
  const update = this.getUpdate();
  const likes = update.$set && update.$set.likes ? update.$set.likes.length : 0;

  // Set the popularity field
  this.update({}, { $set: { popularity: likes } });
  
  // Continue with the update operation
  next();
});

export default mongoose.model("Review", reviewSchema);
