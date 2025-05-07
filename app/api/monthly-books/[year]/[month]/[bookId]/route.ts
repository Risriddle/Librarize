
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import YearlyBooks from '@/lib/models/YearlyBooks';


type Params = Promise<{ bookId: string,month: string,year: number; }>;

type Book = {
  _id: string;
  title: string;
  author: string;
  rating: number;
  coverImageUrl: string;
};

type MonthlyBookEntry = {
  month: string;
  books: Book[];
};

export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  const { bookId, month, year }:{bookId:string,month:string,year:number} = await params;

  if (!year || !month || !bookId) {
    return NextResponse.json({ error: 'Year, month, and bookId are required' }, { status: 400 });
  }

  await dbConnect();

  try {
    // Find the document for the given year
    const yearDoc = await YearlyBooks.findOne({ year });

    if (!yearDoc) {
      return NextResponse.json({ error: 'Year not found' }, { status: 404 });
    }

    // Find the month entry
    const monthEntry = yearDoc.months.find((m: MonthlyBookEntry) => m.month === month);
    if (!monthEntry) {
      return NextResponse.json({ error: 'Month not found in the specified year' }, { status: 404 });
    }

    // Filter out the book by ID
    const initialLength = monthEntry.books.length;
    monthEntry.books = monthEntry.books.filter(
      (book: Book) => book._id.toString() !== bookId
    );

    if (monthEntry.books.length === initialLength) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    await yearDoc.save();

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
