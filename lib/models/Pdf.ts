import mongoose from 'mongoose';

const PdfFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  key:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true
  },
  author:{
    type:String,
    required:true
  },
  rating:{
    type:Number,
    default:0
  },
  review:{
    type:String,
    default:""
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  coverImageUrl: {
    type: String,
    required: false,
  }
  
});

const PdfFile = mongoose.models.PdfFile || mongoose.model('PdfFile', PdfFileSchema);
export default PdfFile;
