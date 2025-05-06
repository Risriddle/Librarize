import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dbConnect from "@/lib/dbConnect";
import PdfFile from "@/lib/models/Pdf";
import Rating from "@/lib/models/Rating";
import Vocab from "@/lib/models/Vocab";
import Quote from "@/lib/models/Quote";
import { Bookmark } from "@/lib/models/Bookmark";


export async function GET(req: NextRequest, context: { params: { bookId: string } }){
const { bookId } = context.params;

  try {
    await dbConnect();

    const pdfFile = await PdfFile.findById(bookId);

    if (!pdfFile) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(pdfFile, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch the book ${error}` }, { status: 500 });
  }
}





export async function PUT(req: NextRequest, context: {params:{bookId: string}}) {
  const { bookId } = context.params;
  const { title, author } = await req.json(); 

  try {
    await dbConnect();

    const updatedPdfFile = await PdfFile.findByIdAndUpdate(
      bookId,
      { title, author}, 
      { new: true }
    );

    if (!updatedPdfFile) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPdfFile, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `Failed to update the book ${error}` }, { status: 500 });
  }
}




// Setup your S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function DELETE(req: NextRequest, context: {params:{bookId: string}}) {
  const { bookId } = context.params;

  try {
    await dbConnect();

    const deletePdfFile = await PdfFile.findById(bookId);
    console.log(deletePdfFile,deletePdfFile.key)
    if (!deletePdfFile) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete from S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: deletePdfFile.key, 
    };


    await s3Client.send(new DeleteObjectCommand(s3Params));

    
     await Rating.deleteMany({pdfId:bookId});
    await Quote.deleteMany({pdfId:bookId});
    await Vocab.deleteMany({pdfId:bookId});
    await Bookmark.deleteMany({pdfId:bookId});
    await PdfFile.findByIdAndDelete(bookId);

    return NextResponse.json({ message: "Book deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete the book" }, { status: 500 });
  }
}
