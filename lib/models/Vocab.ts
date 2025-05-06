import mongoose from "mongoose"

const vocabSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
  },
  meaning: {
    type: String,
    required: true,
  },
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vocab = mongoose.models.Vocab || mongoose.model('Vocab', vocabSchema);
export default Vocab;
