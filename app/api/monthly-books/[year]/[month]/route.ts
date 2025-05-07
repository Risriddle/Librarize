// app/api/monthly-books/[year]/[month]/route.ts
import { NextResponse } from 'next/server';
import  dbConnect  from '@/lib/dbConnect';
import YearlyBooks from '@/lib/models/YearlyBooks';



type Book = {
  _id: string;
  title: string;
  author: string;
  rating: number;
  coverImageUrl: string;
};

type Params = Promise<{ month: string,year:number }>;

type MonthlyBookEntry = {
  month: string;
  books: Book[];
};




export async function POST(req: Request,{params}:{params:Params}) {
  await dbConnect();
  const { month,year }: {month:string,year:number} = await params; 
  console.log(month,year,"post year>month----------------------------")
  const {books: incomingBooks }: { books: Book[]} = await req.json();

  try {
    // Find the year document
    let yearDoc = await YearlyBooks.findOne({ year });

    if (!yearDoc) {
      // Create a new year document if not found
      yearDoc = await YearlyBooks.create({
        year,
        months: [{ month, books: incomingBooks }]
      });
    } else {
      // Find the month entry inside the year document
      const monthEntry = yearDoc.months.find((m: MonthlyBookEntry) => m.month === month);

      if (!monthEntry) {
        // Add new month with books
        yearDoc.months.push({ month, books: incomingBooks });
      } else {
        // Filter out duplicate books based on _id
        const existingIds = new Set(monthEntry.books.map((book: Book) => book._id.toString()));
        const uniqueBooks = incomingBooks.filter(
          book => !existingIds.has(book._id.toString())
        );

        // Push unique books
        monthEntry.books.push(...uniqueBooks);
      }

      await yearDoc.save();
    }

    return NextResponse.json(yearDoc, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

