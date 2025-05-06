import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  rating:Number,
  title: String,
  author: String,
  coverImageUrl: String,
});

const monthlyBooksSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  year: { type: Number, default: () => new Date().getFullYear() },
  books: [bookSchema]
});

export default mongoose.models.MonthlyBooks || mongoose.model('MonthlyBooks', monthlyBooksSchema);


