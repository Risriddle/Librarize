import { NextResponse,NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vocab from "@/lib/models/Vocab"


// POST: Save a word
export async function POST(req: NextRequest) {
  await dbConnect();
  const { word, meaning, pdfId } = await req.json();

  // Check if the word already exists for this PDF
  const existing = await Vocab.findOne({ word, pdfId });
  if (existing) {
    return NextResponse.json(
      { message: "Word already exists", word },
      { status: 409 } // Conflict
    );
  }

  const saved = await Vocab.create({ word, meaning, pdfId });
  return NextResponse.json({ message: "Saved", saved }, { status: 201 });
}


// GET: Fetch vocab by pdfId
export async function GET(req:NextRequest) {
  await dbConnect();
  const pdfId = req.nextUrl.searchParams.get("pdfId");
  const words = await Vocab.find({ pdfId });
  return NextResponse.json(words, { status: 200 });
}



// DELETE: Delete a vocab word by ID
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  await Vocab.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
