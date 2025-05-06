"use client"

import { useState, useEffect } from 'react';
import { Book } from '@/lib/interfaces/Book';
import { BookOpen, RefreshCcw } from 'lucide-react';
import type { JSX } from 'react';

interface TbrJarProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

export default function TbrJar({ books, onSelect }: TbrJarProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isJarShaking, setIsJarShaking] = useState(false);
  const [bookMiniatures, setBookMiniatures] = useState<JSX.Element[]>([]);
  
  // Generate mini book covers for the jar
  useEffect(() => {
    const miniBooks = books.map((book, index) => (
      <div 
        key={book._id}
        className="absolute rounded shadow-md transform transition-all duration-500"
        style={{
          width: `${50 + Math.random() * 15}px`,
          height: `${70 + Math.random() * 15}px`,
          top: `${15 + Math.random() * 50}%`,
          left: `${15 + Math.random() * 50}%`,
          transform: `rotate(${Math.random() * 60 - 30}deg)`,
          zIndex: index,
          perspective: '100px',
          transformStyle: 'preserve-3d'
        }}
      >
        <img 
          src={book.coverImageUrl} 
          alt={book.fileName}
          className="w-full h-full object-cover rounded border border-amber-700"
        />
      </div>
    ));
    setBookMiniatures(miniBooks);
  }, [books]);
  
  const pickRandomBook = () => {
    if (books.length === 0) {
      return;
    }
    
    setSelectedBook(null);
    setIsJarShaking(true);
    
    // Simulate jar shaking animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * books.length);
      setSelectedBook(books[randomIndex]);
      setIsJarShaking(false);
    }, 1500);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-amber-100 mb-6">TBR Jar</h2>
      
      {books.length === 0 ? (
        <div className="text-center mb-8">
          <p className="text-amber-200 mb-4">Your TBR jar is empty!</p>
          <p className="text-amber-300">Add some books to your TBR list to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-8">
          {/* The Jar */}
          <div 
            className={`relative w-60 h-72 rounded-2xl overflow-hidden mb-6 ${isJarShaking ? 'animate-shake' : ''}`}
            style={{
              animation: isJarShaking ? "shake 0.5s infinite" : "none"
            }}
          >
            {/* Glass jar effect */}
            <div className="absolute inset-0 bg-amber-100 bg-opacity-30 rounded-2xl shadow-lg border-2 border-amber-500"
              style={{
                background: "radial-gradient(ellipse at center, rgba(253, 230, 138, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)",
                boxShadow: "inset 0 0 20px rgba(217, 119, 6, 0.3), 0 5px 15px rgba(0,0,0,0.2)"
              }}
            ></div>
            
           


            <div
  className="absolute top-0 left-0 right-0 h-10 rounded-t-2xl border-b-2 overflow-visible z-10"
  style={{
    background: "linear-gradient(to bottom, #a3561c 0%, #78350f 80%, #5c2a0a 100%)",
    borderColor: "#5b2c06",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)",
  }}
>
  {/* Lid knob */}
  <div
    className="absolute z-20 left-1/2 -top-4 transform -translate-x-1/2 w-10 h-8 rounded-full border shadow-md"
    style={{
      background: "radial-gradient(circle at 30% 30%, #7c3a03, #4e2101)",
      borderColor: "#3b1a01",
      boxShadow: "0 1px 2px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(255,255,255,0.2)",
    }}
  ></div>
</div>



            
            {/* Book miniatures inside jar */}
            <div className="absolute inset-0 mt-10 overflow-hidden rounded-b-2xl">
              {bookMiniatures}
            </div>
            
            {/* Glass reflection overlay */}
            <div className="absolute inset-0 rounded-2xl" 
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)"
              }}
            ></div>
          </div>
          
          <button
            onClick={pickRandomBook}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 flex items-center gap-2 shadow-md"
            disabled={isJarShaking}
          >
            <RefreshCcw size={18} className={isJarShaking ? 'animate-spin' : ''} />
            Pick a Random Book
          </button>
        </div>
      )}
      
      {/* Selected Book Display */}
      {selectedBook && (
        <div className="border-t border-amber-700 pt-6 w-full">
          <h3 className="text-xl font-semibold text-amber-100 mb-4 text-center">Your Next Read:</h3>
          <div className="flex items-center justify-center gap-6 bg-amber-900 p-4 rounded-lg shadow-inner">
            <div className="w-24 h-32 rounded-sm shadow-lg overflow-hidden border-2 border-amber-400">
              <img src={selectedBook.coverImageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-amber-100 mb-2">{selectedBook.fileName}</h4>
              <button
                onClick={() => onSelect(selectedBook)}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center gap-2 mt-4 shadow-md"
              >
                <BookOpen size={16} />
                Start Reading
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* TBR Book List */}
      <div className="mt-8 w-full border-t border-amber-700 pt-6">
        <h3 className="text-xl font-semibold text-amber-100 mb-4">All TBR Books</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {books.map((book) => (
            <div key={book._id} className="flex items-start gap-2 bg-amber-900 p-2 rounded hover:bg-amber-800 transition-colors">
              <div className="w-12 h-16 bg-amber-200 rounded-sm shadow overflow-hidden border border-amber-400">
                <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-medium text-amber-100 text-sm truncate">{book.fileName}</h4>
                <button
                  onClick={() => onSelect(book)}
                  className="mt-2 text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded transition-colors flex items-center gap-1"
                >
                  <BookOpen size={12} />
                  Read
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}