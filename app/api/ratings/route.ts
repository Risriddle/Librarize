import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Rating from "@/lib/models/Rating";
import PdfFile from "@/lib/models/Pdf";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    const { rating, review } = await req.json();

    if (!pdfId || !rating) {
      return NextResponse.json(
        { success: false, message: "pdfId and rating are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await Rating.findOne({ pdfId });
    const book = await PdfFile.findOne({ _id:pdfId });
console.log(book,pdfId,"---------------------------------------------------")
    if (!book) {
      return NextResponse.json({ success: false, message: "PDF not found" }, { status: 404 });
    }

    if (existing) {
      existing.rating = rating;
      existing.review = review;
      existing.updatedAt = new Date();
      await existing.save();

      book.rating = rating;
      book.review = review;
      book.updatedAt = new Date();
      await book.save();

      return NextResponse.json({ success: true, data: existing });
    }

    const newRating = await Rating.create({
      pdfId,
      rating,
      review,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ✅ update PdfFile even in new rating creation
    book.rating = rating;
    book.review = review;
    book.updatedAt = new Date();
    await book.save();

    return NextResponse.json({ success: true, data: newRating });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
  
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    const { rating, review } = await req.json();

    if (!pdfId || !rating) {
      return NextResponse.json(
        { success: false, message: "pdfId and rating are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await Rating.findOne({ pdfId });
    const book = await PdfFile.findOne({ _id: pdfId });

    if (!book) {
      return NextResponse.json({ success: false, message: "PDF not found" }, { status: 404 });
    }

    if (!existing) {
      return NextResponse.json({ success: false, message: "Rating not found" }, { status: 404 });
    }

    existing.rating = rating;
    existing.review = review;
    existing.updatedAt = new Date();
    await existing.save();

    book.rating = rating;
    book.review = review;
    book.updatedAt = new Date();
    await book.save();

    return NextResponse.json({ success: true, data: existing });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
  
}


export async function GET(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const pdfId = searchParams.get("pdfId");
  
      if (!pdfId) {
        return NextResponse.json({ success: false, message: "pdfId is required" }, { status: 400 });
      }
  
      await dbConnect();
      const rating = await Rating.findOne({ pdfId });
      if(rating!=null){   return NextResponse.json({ success: true, data: rating });}
      else{   return NextResponse.json({ success:false });}
   
    }catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
    
  }
  