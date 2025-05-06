import mongoose from "mongoose";

// Define Quote schema
const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  pdfId: {
    type: String,
    required: true,
  },
  pageIndex: {
    type: Number,  // Add this field for page number
    required: true, // You can set it to true if you want to make sure it's always included
  },
  position: {
    type: Object,  // Add this field for position of the selection in the page
    required: true, // Optional based on your needs
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Quote model (or get it if it already exists)
const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);

export default Quote;
