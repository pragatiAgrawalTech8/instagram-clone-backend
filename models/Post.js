import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String, // Cloudinary URL
      required: true,
    },
    imagePublicId: {
      type: String, // Cloudinary public_id (delete karne ke liye zaroori)
      required: true,
    },
    caption: {
      type: String,
      default: "",
      maxlength: 2200, // Instagram jaisa limit
    },
    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    comments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    ],
    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // createdAt, updatedAt auto add ho jayega
);

const Post = mongoose.model("Post", postSchema);
export default Post;