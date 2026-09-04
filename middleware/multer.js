import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary storage engine configure karo
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "instagram-clone", // Cloudinary pe is folder mein sab images jayengi
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1080, height: 1080, crop: "limit" }], // auto-resize (Instagram jaisa)
  },
});

// File filter — Only image files are allowed 
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed  (jpg, png, webp)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB per image
  },
});

export default upload;