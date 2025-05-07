import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MonthlyBooks from '@/lib/models/MonthlyBooks';


type Params = Promise<{ bookId: string,month:string }>;


export async function DELETE(req: Request, {params}: {params:Params}) {
  const { bookId,month }: {bookId: string,month:string} = await params; 
  const url = new URL(req.url);
  const year = url.searchParams.get('year');  // Extract year from query params

  if (!year) {
    return NextResponse.json({ error: 'Year is required' }, { status: 400 });
  }

  await dbConnect();

  try {
    // Find the document with the specified year and month, and pull the book with the given ID
    const result = await MonthlyBooks.findOneAndUpdate(
      { year, month }, // Find by both year and month
      { $pull: { books: { _id: bookId } } },  // Pull book with given bookId
      { new: true }  // Return the updated document
    );

    if (!result) {
      return NextResponse.json({ error: 'Month or book not found for the specified year' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
