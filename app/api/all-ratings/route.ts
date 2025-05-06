import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Rating from "@/lib/models/Rating";

export async function GET() {
  try {
    await dbConnect();

    const allRatings = await Rating.find({});
    return NextResponse.json({ success: true, data: allRatings });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
  }
}
