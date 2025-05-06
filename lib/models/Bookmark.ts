import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    pageIndex: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    pdfId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite issue in Next.js
export const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);
