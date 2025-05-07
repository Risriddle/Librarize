
// import { NextResponse } from 'next/server';
// import  dbConnect  from '@/lib/dbConnect';
// import YearlyBooks from '@/lib/models/YearlyBooks';

// type MonthlyBookEntry = {
//   month: string;
//   books: Book[];
// };


// type Book = {
//   _id: string;
//   title: string;
//   author: string;
//   rating: number;
//   coverImageUrl: string;
// };




// type Params = Promise<{ year:number }>;

// export async function GET(req: Request,{params}:{params:Params}) {
//   await dbConnect();

//   try {
    
//     const {year}:{year:number} = await params

//     const yearDoc = await YearlyBooks.findOne({ year });

//     if (!yearDoc) {
//       return NextResponse.json([], { status: 200 });
//     }

//     // Format data as { "January": [books], ... }
//     const formatted = yearDoc.months.reduce((acc: Record<string, Book[]>, monthEntry:MonthlyBookEntry ) => {
//       acc[monthEntry.month] = monthEntry.books.map((book: Book) => ({
//         _id: book._id,
//         title: book.title,
//         author: book.author,
//         rating: book.rating,
//         coverImageUrl: book.coverImageUrl,
//       }));
//       return acc;
//     }, {});

//     return NextResponse.json(formatted, { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
//   }
// }
















import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import YearlyBooks from '@/lib/models/YearlyBooks';
import PdfFile from '@/lib/models/Pdf';



type Book = {
  _id: string;
  title: string;
  author: string;
  rating: number;
  coverImageUrl: string;
};

type Params = Promise<{ year: number }>;

export async function GET(req: Request, { params }: { params: Params }) {
  await dbConnect();

  try {
    const { year }: { year: number } = await params;

    const yearDoc = await YearlyBooks.findOne({ year });

    if (!yearDoc) {
      return NextResponse.json([], { status: 200 });
    }

    const formatted: Record<string, Book[]> = {};

    for (const monthEntry of yearDoc.months) {
      const syncedBooks = await Promise.all(
        monthEntry.books.map(async (book:Book) => {
          const updated = await PdfFile.findById(book._id);
          return {
            _id: book._id,
            title: book.title,
            author: book.author,
            rating: updated?.rating || book.rating,
            coverImageUrl: book.coverImageUrl,
          };
        })
      );

      formatted[monthEntry.month] = syncedBooks;
    }

    return NextResponse.json(formatted, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
