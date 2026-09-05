import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Create new post
// @route   POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { caption, location } = req.body;

    // Image check — multer se aayi hogi
    if (!req.file) {
      return res.status(400).json({ message: "Post ke liye image zaroori hai" });
    }

    const newPost = await Post.create({
      user: req.user._id,
      image: req.file.path,          // Cloudinary URL
      imagePublicId: req.file.filename, // Cloudinary public_id
      caption: caption || "",
      location: location || "",
    });

    // User ke posts array mein bhi add karo
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: newPost._id },
    });

    // Response mein user data bhi populate karke bhejo
    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "username profilePic"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get feed posts (logged-in user + following users ke posts)
// @route   GET /api/posts/feed
export const getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Following users + khud ke posts dikhao
    const userIds = [...currentUser.following, currentUser._id];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        options: { limit: 2, sort: { createdAt: -1 } }, // sirf 2 latest comments preview
        populate: { path: "user", select: "username" },
      })
      .sort({ createdAt: -1 }); // naye posts pehle

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all posts (Explore page ke liye)
// @route   GET /api/posts/explore
export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 })
      .limit(50); // performance ke liye limit lagao

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePic" },
        options: { sort: { createdAt: -1 } },
      });

    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get posts of a specific user (profile page ke liye)
// @route   GET /api/posts/user/:userId
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Like / Unlike a post (toggle)
// @route   PUT /api/posts/:id/like
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike karo
      post.likes.pull(req.user._id);
    } else {
      // Like karo
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post nahi mila" });
    }

    // Sirf apna hi post delete kar sake
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Aap sirf apna post delete kar sakte hain" });
    }

    // Cloudinary se image delete karo
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    // Related comments bhi delete karo
    await Comment.deleteMany({ post: post._id });

    // User ke posts array se bhi remove karo
    await User.findByIdAndUpdate(post.user, {
      $pull: { posts: post._id },
    });

    await post.deleteOne();

    res.status(200).json({ message: "Post delete ho gaya" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};