
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  rating: Number,
  title: String,
  author: String,
  coverImageUrl: String,
});

const monthSchema = new mongoose.Schema({
  month: { type: String, required: true },
  books: [bookSchema]
});

const yearSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  months: [monthSchema]
});

export default mongoose.models.YearlyBooks || mongoose.model('YearlyBooks', yearSchema);
