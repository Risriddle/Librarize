import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Bookmark } from "@/lib/models/Bookmark";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { pageIndex, label, pdfId } = body;

    const newBookmark = await Bookmark.create({ pageIndex, label, pdfId });
    return NextResponse.json(newBookmark, { status: 201 });
  } catch (error) {
    console.error("Error saving bookmark:", error);
    return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500 });
  }
}




export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    const query = pdfId ? { pdfId } : {};
    const bookmarks = await Bookmark.find(query);

    return NextResponse.json(bookmarks, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}
