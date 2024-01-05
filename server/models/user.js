// @ts-nocheck
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name!"],
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      require: [true, "Please provide an email!"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email!",
      },
    },
    password: {
      type: String,
      trim: true,
      require: [true, "Please provide a password!"],
      minlength: 6,
      select: true,
    },
    secret: {
      type: String,
      required: [true, "Please provide a secret!"],
    },
    about: {
      type: String,
    },
    image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    follower: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    ],
    challenges: [
      {
        year: Number,
        number: Number,
      },
    ],
    points: {
      type: Number,
      require: true,
      default: 0,
    },
    featuredShelf: {
      type: mongoose.Types.ObjectId,
      ref: "Shelf",
    },
    blocked: {
      type: String,
      enum: ["Clean", "Reported", "Blocked"],
      default: "Clean",
      required: true,
    },
    role: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", userSchema);
