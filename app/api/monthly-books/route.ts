// app/api/monthly-books/route.ts
import { NextResponse } from 'next/server';
import  dbConnect  from '@/lib/dbConnect';
import MonthlyBooks from '@/lib/models/MonthlyBooks';

type MonthlyBookEntry = {
  year: string;
  month: string;
  books: Book[];
};


type Book = {
  _id: string;
  title: string;
  author: string;
  rating: number;
  coverImageUrl: string;
};


export async function POST(req: Request) {
  await dbConnect();
  const { month, books: incomingBooks,year }: { month: string, books: Book[],year:number } = await req.json();


  try {
    // Check if month already exists
    let monthDoc = await MonthlyBooks.findOne({ month });

    if (!monthDoc) {
      // If not, create a new document with year and books
      monthDoc = await MonthlyBooks.create({
        month,
        year:year,
        books: incomingBooks
      });
    } else {
      // Filter incomingBooks to exclude duplicates
       console.log(monthDoc.books,"-----------------------------")
       const existingIds = new Set(monthDoc.books.map((book:Book) => book._id.toString()));
       const uniqueBooks = incomingBooks.filter(
         book => !existingIds.has(book._id.toString())
       );
       

      // Push only new books
      monthDoc.books.push(...uniqueBooks);
      await monthDoc.save();
    }

    return NextResponse.json(monthDoc, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}





export async function GET(req: Request) {
  await dbConnect();

  try {
    // Extract the year from the request params
    const url = new URL(req.url);
    const year = url.searchParams.get('year');
    
    // Fetch all MonthlyBooks for the specific year
    const allMonthlyBooks = await MonthlyBooks.find({ year });

    // Convert the array to an object by month
    const formatted = allMonthlyBooks.reduce((acc: Record<string, Book[]>, entry: MonthlyBookEntry) => {
   
      // Map books with necessary fields
      const booksWithId = entry.books.map((book:Book) => ({
        _id: book._id,
        title: book.title,
        author: book.author,
        rating:book.rating,
        coverImageUrl: book.coverImageUrl,
      }));

      acc[entry.month] = booksWithId;
      return acc;
    }, {});

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
