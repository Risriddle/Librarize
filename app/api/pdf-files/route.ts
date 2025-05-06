import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PdfFile from "@/lib/models/Pdf";

export async function GET() {
  try {
    await dbConnect(); 

    // Fetch all PDF files from the database
    const pdfFiles = await PdfFile.find({});
    
    return NextResponse.json(pdfFiles, { status: 200 }); 
  } catch (error) {
    return NextResponse.json({ error: `Failed to fetch PDF files ${error}` }, { status: 500 });
  }
}
