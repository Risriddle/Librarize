// app/api/monthly-books/[month]/route.ts
import { NextResponse } from 'next/server';
import  dbConnect  from '@/lib/dbConnect';
import MonthlyBooks from '@/lib/models/MonthlyBooks';

export async function GET(req: Request, context: { params: { month: string } }) {
  await dbConnect();
  const {month}=context.params
  try {
    const data = await MonthlyBooks.findOne({ month: month });
    return NextResponse.json(data || { month:month, books: [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `Fetch failed ${err}` }, { status: 500 });
  }
}
