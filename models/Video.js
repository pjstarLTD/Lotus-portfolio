import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ["video", "image"],
    default: "video",
  },
  thumbnailUrl: String,
  duration: String,
  category: {
    type: String,
    default: "General",
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;