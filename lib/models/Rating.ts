import mongoose from "mongoose";

// Define Quote schema
const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    default: "",
  },
  pdfId: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Quote model (or get it if it already exists)
const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

export default Rating;
