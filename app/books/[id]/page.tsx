"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ViewPdf = dynamic(() => import('@/components/ViewPdf'), {
  ssr: false,
});
// import ViewPdf from '@/components/ViewPdf';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';

export default function BookPage() {
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const bookId = params.id;

  useEffect(() => {
    async function fetchBookData() {
      if (!bookId) {
        setError("No book ID provided");
        setIsLoading(false);
        return;
      }
      
      try {
        // Replace with your actual API endpoint to fetch book data
        const response = await fetch(`/api/books/${bookId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load book (Status: ${response.status})`);
        }
        
        const data = await response.json();
        setBookUrl(data.fileUrl);
        setPdfId(data._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBookData();
  }, [bookId]);

  if (isLoading) {
    return (
     <Loader/>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error Loading Book</h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  if (!pdfId) {
    return <div>PDF ID not found</div>;
  }
 
  
  if (!bookUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold">Book Not Found</h2>
          <p className="mb-6 text-gray-700">The requested book could not be found or does not have a PDF available.</p>
          <button 
            onClick={() => window.history.back()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isHomePage={false}
      />
     
     

      <main className="flex-1 overflow-hidden">
        <ViewPdf url={bookUrl} pdfId={pdfId} />
      </main>
    </div>
  );
}