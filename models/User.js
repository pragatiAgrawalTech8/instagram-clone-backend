import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "", // Cloudinary URL yahan store hogi
    },
    bio: {
      type: String,
      default: "",
      maxlength: 150,
    },
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    posts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    ],
    savedPosts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    ],
  },
  { timestamps: true } // createdAt, updatedAt auto add ho jayega
);

const User = mongoose.model("User", userSchema);
export default User;