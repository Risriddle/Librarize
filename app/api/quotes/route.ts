// File: app/api/quotes/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Quote from "@/lib/models/Quote"


// GET handler to fetch quotes for a specific PDF
export async function GET(request: NextRequest) {
  try {
   

    // Get pdfId from URL parameter
    const { searchParams } = new URL(request.url);
    const pdfId = searchParams.get("pdfId");

    if (!pdfId) {
      return NextResponse.json({ error: "PDF ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Find quotes with matching pdfId and userId
    const quotes = await Quote.find({
      pdfId,
    
    }).sort({ createdAt: -1 }); // Most recent first

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

// POST handler to save a new quote
export async function POST(request: NextRequest) {
  try {
  

    const body = await request.json();
    const { text, note, pdfId,pageIndex,position ,color} = body;

    if (!text || !pdfId) {
      return NextResponse.json(
        { error: "Text and PDF ID are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create a new quote
    const quote = new Quote({
      text,
      note: note || "",
      pdfId,
      color,
      pageIndex,
      position
     
    });

    await quote.save();
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error saving quote:", error);
    return NextResponse.json({ error: "Failed to save quote" }, { status: 500 });
  }
}

// DELETE handler (optional - for future feature to delete quotes)
export async function DELETE(request: NextRequest) {
  try {
   
  
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("id");

    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Find and delete the quote (ensuring it belongs to the current user)
    const deletedQuote = await Quote.findOneAndDelete({
      _id: quoteId,
    
    });

    if (!deletedQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}