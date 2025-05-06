"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import UploadPdf from "@/components/UploadPdf";
import TbrJar from "@/components/TbrJar";
import type { Book } from "@/lib/interfaces/Book";
import Loader from "@/components/Loader";
import BookReview from "@/components/BookReview";
import Navbar from "@/components/Navbar";
import {
  Trash2,
  BookOpen,
  Check,
  BookMarked,
  X,
  Star,
  BookAIcon,
  AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
const AnalogClock = dynamic(() => import("@/components/AnalogClock"), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentlyReading, setCurrentlyReading] = useState<string[]>([]);
  const [completedBooks, setCompletedBooks] = useState<string[]>([]);
  const [tbrBooks, setTbrBooks] = useState<string[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );
  const [showTbrJar, setShowTbrJar] = useState(false);
 
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentBookForReview, setCurrentBookForReview] = useState<string>("");

  const [bookOptionsModal, setBookOptionsModal] = useState({
    isOpen: false,
    bookId: "",
    bookTitle: "",
  });

  const [dnfBooks, setDnfBooks] = useState<string[]>([]);

  useEffect(() => {
    fetchPdfFiles();

    const storedCurrentlyReading = localStorage.getItem("currentlyReading");
    const storedCompletedBooks = localStorage.getItem("completedBooks");
    const storedTbrBooks = localStorage.getItem("tbrBooks");
    const storedDnfBooks = localStorage.getItem("dnfBooks");
    if (storedDnfBooks) {
      setDnfBooks(JSON.parse(storedDnfBooks));
    }

    if (storedCurrentlyReading) {
      setCurrentlyReading(JSON.parse(storedCurrentlyReading));
    }
    if (storedCompletedBooks) {
      setCompletedBooks(JSON.parse(storedCompletedBooks));
    }
    if (storedTbrBooks) {
      setTbrBooks(JSON.parse(storedTbrBooks));
    }
   

    const style = document.createElement("style");
    style.innerHTML = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(146, 64, 14, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(146, 64, 14, 0.5);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(146, 64, 14, 0.7);
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchPdfFiles = async () => {
    try {
      const response = await axios.get("/api/pdf-files");
      console.log(response.data);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
    setLoading(false);
  };


  const handleDeleteBook = async (bookId: string) => {
    try {
      await axios.delete(`/api/books/${bookId}`);
  
      // Filter each list
      const updatedCurrentlyReading = currentlyReading.filter((id) => id !== bookId);
      const updatedCompletedBooks = completedBooks.filter((id) => id !== bookId);
      const updatedTbrBooks = tbrBooks.filter((id) => id !== bookId);
      const updatedDnfBooks = dnfBooks.filter((id) => id !== bookId);
  
      // Update state
      setCurrentlyReading(updatedCurrentlyReading);
      setCompletedBooks(updatedCompletedBooks);
      setTbrBooks(updatedTbrBooks);
      setDnfBooks(updatedDnfBooks);
  
      // Update localStorage
      updateLocalStorage("currentlyReading", updatedCurrentlyReading);
      updateLocalStorage("completedBooks", updatedCompletedBooks);
      updateLocalStorage("tbrBooks", updatedTbrBooks);
      updateLocalStorage("dnfBooks", updatedDnfBooks);
  
      // Update reading challenge if needed
      // Optional: If challenge count depends on completed books
      const challenge = JSON.parse(localStorage.getItem("readingChallenge") || "0");
      if (completedBooks.includes(bookId)) {
        const updatedChallenge = challenge > 0 ? challenge - 1 : 0;
        localStorage.setItem("readingChallenge", updatedChallenge.toString());
      }
  
      // Refresh book list and clear confirmation
      fetchPdfFiles();
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };
  

  const updateLocalStorage = (key: string, value:unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const toggleDnf = (bookId: string) => {
    let updatedDnf;
    // If already in DNF, remove it
    if (dnfBooks.includes(bookId)) {
      updatedDnf = dnfBooks.filter((id) => id !== bookId);
    } else {
      // Add to DNF and remove from other lists
      updatedDnf = [...dnfBooks, bookId];

      // Remove from currently reading if it was there
      if (currentlyReading.includes(bookId)) {
        const updatedReading = currentlyReading.filter((id) => id !== bookId);
        setCurrentlyReading(updatedReading);
        updateLocalStorage("currentlyReading", updatedReading);
      }

      // Remove from TBR if it was there
      if (tbrBooks.includes(bookId)) {
        const updatedTbr = tbrBooks.filter((id) => id !== bookId);
        setTbrBooks(updatedTbr);
        updateLocalStorage("tbrBooks", updatedTbr);
      }

      // Remove from completed if it was there
      if (completedBooks.includes(bookId)) {
        const updatedCompleted = completedBooks.filter((id) => id !== bookId);
        setCompletedBooks(updatedCompleted);
        updateLocalStorage("completedBooks", updatedCompleted);

       
      }
    }

    setDnfBooks(updatedDnf);
    updateLocalStorage("dnfBooks", updatedDnf);
  };
  const toggleCurrentlyReading = (bookId: string) => {
    let updatedReading;
    // If already in currently reading, remove it
    if (currentlyReading.includes(bookId)) {
      updatedReading = currentlyReading.filter((id) => id !== bookId);
    } else {
      // Add to currently reading and remove from tbr if present
      updatedReading = [...currentlyReading, bookId];
      // Remove from TBR list if it was there
      if (tbrBooks.includes(bookId)) {
        const updatedTbr = tbrBooks.filter((id) => id !== bookId);
        setTbrBooks(updatedTbr);
        updateLocalStorage("tbrBooks", updatedTbr);
      }
    }
    setCurrentlyReading(updatedReading);
    updateLocalStorage("currentlyReading", updatedReading);
  };

  const toggleCompleted = (bookId: string) => {
    let updatedCompleted;
    // If already completed, remove it
    if (completedBooks.includes(bookId)) {
      updatedCompleted = completedBooks.filter((id) => id !== bookId);
    
    } else {
      // Add to completed and remove from currently reading/TBR if present
      updatedCompleted = [...completedBooks, bookId];
      // Remove from currently reading if it was there
      if (currentlyReading.includes(bookId)) {
        const updatedReading = currentlyReading.filter((id) => id !== bookId);
        setCurrentlyReading(updatedReading);
        updateLocalStorage("currentlyReading", updatedReading);
      }
      // Remove from TBR if it was there
      if (tbrBooks.includes(bookId)) {
        const updatedTbr = tbrBooks.filter((id) => id !== bookId);
        setTbrBooks(updatedTbr);
        updateLocalStorage("tbrBooks", updatedTbr);
      }
      
    }
    setCompletedBooks(updatedCompleted);
    updateLocalStorage("completedBooks", updatedCompleted);
  };

  const toggleTbr = (bookId: string) => {
    let updatedTbr;
    // If already in TBR, remove it
    if (tbrBooks.includes(bookId)) {
      updatedTbr = tbrBooks.filter((id) => id !== bookId);
    } else {
      // Add to TBR and remove from currently reading if present
      updatedTbr = [...tbrBooks, bookId];
      // Remove from currently reading if it was there
      if (currentlyReading.includes(bookId)) {
        const updatedReading = currentlyReading.filter((id) => id !== bookId);
        setCurrentlyReading(updatedReading);
        updateLocalStorage("currentlyReading", updatedReading);
      }
    }
    setTbrBooks(updatedTbr);
    updateLocalStorage("tbrBooks", updatedTbr);
  };

  const filteredBooks = books?.filter((book) =>
    book?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentlyReadingBooks = books.filter((book) =>
    currentlyReading.includes(book._id)
  );

  const completedBooksList = books.filter((book) =>
    completedBooks.includes(book._id)
  );

  const tbrBooksList = books.filter((book) => tbrBooks.includes(book._id));

  

  // Add this function to handle book click
  const handleBookClick = (e: React.FormEvent, book: Book) => {
    e.preventDefault();
    setBookOptionsModal({
      isOpen: true,
      bookId: book._id,
      bookTitle: book.title,
    });
  };

  return (
    <div className="min-h-screen bg-amber-950 text-amber-50">
      <Head>
        <title>Book Reader</title>
        <meta
          name="description"
          content="A cozy digital reading room for your books"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar
        isHomePage={true}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onShowUploadModal={() => setShowUploadModal(true)}
        onShowTbrJar={() => setShowTbrJar(true)}
      />

      {loading && <Loader />}

      <div
        className={`transition-all duration-300 ${
          loading ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <main className="container mx-auto px-4 py-8">
          {/* Cozy Reading Room */}
          <div className="relative bg-gradient-to-b from-amber-950 to-amber-900 rounded-lg overflow-hidden shadow-2xl mb-8">
            {/* String lights */}
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-center">
              <div className="h-full w-4/5 bg-transparent border-t-2 border-l-2 border-r-2 border-amber-600 rounded-t-3xl relative">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={`light-${i}`}
                    className="absolute top-0 h-3 w-3 bg-amber-200 rounded-full shadow-lg shadow-amber-200"
                    style={{ left: `${i * 5}%`, transform: "translateY(-50%)" }}
                  >
                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-70"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Container */}
            <div className="pt-12 pb-4 px-4 md:px-6 bg-gradient-to-b from-amber-950 to-amber-900">
              <AnalogClock />

              <div className="absolute top-16 left-6 w-32 h-44 rounded-lg overflow-hidden border-[6px] border-amber-900 bg-amber-100 shadow-[4px_4px_10px_rgba(0,0,0,0.4)] hidden md:block ">
                <img
                  src="/images/dan.jpg"
                  alt="fav author"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-8 pt-8 flex justify-center">
                <div className="w-full max-w-6xl">
                  {/* The Room */}
                  <div className="relative bg-gradient-to-br from-amber-900 to-amber-950 rounded-lg shadow-inner p-6 md:p-12">
                    {/* Slanted ceiling effect */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-amber-950 to-transparent opacity-80"></div>

                    {/* Bookshelf and Seating Area */}
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Wooden Bookshelf */}
                      <div className="flex-1 bg-gradient-to-b from-amber-800 to-amber-700 rounded-md shadow-lg border border-amber-600 relative overflow-hidden">
                        {/* Bookshelf frame */}
                        <div className="absolute inset-0 border-4 border-amber-600 rounded-md"></div>

                        <div className="absolute left-0 right-0 top-0 h-4 bg-amber-600"></div>
                        <div className="absolute left-0 right-0 bottom-0 h-4 bg-amber-600"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-amber-600"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-amber-600"></div>

                        {/* Shelves */}
                        <div className="pt-8 pb-8 px-6 relative">
                          {loading ? (
                            <Loader />
                          ) : (
                            <h2 className="text-2xl font-semibold text-amber-100 mb-6 text-center">
                              My Bookshelf
                            </h2>
                          )}

                          {/* Empty state */}
                          {!loading && filteredBooks.length === 0 && (
                            <div className="text-center py-12">
                              <p className="text-xl text-amber-200">
                                Your bookshelf is empty!
                              </p>
                              <p className="text-amber-300">
                                Add some books to get started
                              </p>
                            </div>
                          )}

                          {/* Shelves with books */}
                          {filteredBooks.length > 0 && (
                            <div
                              className={`${
                                // Only apply scrolling when we have more than a certain number of books
                                // that would fill the visible area completely
                                filteredBooks.length > 20
                                  ? "max-h-96 overflow-y-auto pr-2 custom-scrollbar"
                                  : ""
                              }`}
                            >
                              {Array.from({
                                length: Math.ceil(filteredBooks.length / 5),
                              }).map((_, shelfIndex) => {
                                const shelfBooks = filteredBooks.slice(
                                  shelfIndex * 5,
                                  shelfIndex * 5 + 5
                                );

                                return (
                                  <div
                                    key={shelfIndex}
                                    className="relative mb-16"
                                  >
                                    {/* Shelf wooden plank */}
                                    <div className="absolute left-4 right-4 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bottom-0 transform translate-y-5 shadow-md"></div>

                                    {/* Books */}
                                    <div className="flex justify-center mb-12">
                                      <div className="flex w-full justify-center gap-2">
                                        {shelfBooks.length > 0 ? (
                                          shelfBooks.map((book, idx) => (
                                            <div
                                              key={book._id}
                                              className="relative group"
                                            >
                                              <div
                                                onClick={(e) =>
                                                  handleBookClick(e, book)
                                                }
                                                className="cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-3 group relative"
                                                style={{
                                                  transform: `rotate(${
                                                    idx % 2 === 0 ? "1" : "-1"
                                                  }deg)`,
                                                  zIndex: idx,
                                                }}
                                              >
                                                <div
                                                  className={`relative w-16 sm:w-20 h-40 rounded-sm overflow-hidden shadow-md border ${
                                                    completedBooks.includes(
                                                      book._id
                                                    )
                                                      ? "border-purple-400 ring-2 ring-purple-400"
                                                      : currentlyReading.includes(
                                                          book._id
                                                        )
                                                      ? "border-green-400 ring-2 ring-green-400"
                                                      : tbrBooks.includes(
                                                          book._id
                                                        )
                                                      ? "border-blue-400 ring-2 ring-blue-400"
                                                      : dnfBooks.includes(
                                                          book._id
                                                        )
                                                      ? "border-red-400 ring-2 ring-red-400"
                                                      : "border-amber-400"
                                                  } transform`}
                                                >
                                                  {/* Book spine details */}
                                                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-900/20 to-transparent"></div>

                                                  {/* Book cover */}
                                                  <img
                                                    src={book.coverImageUrl}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                  />

                                                  {/* Status indicator */}
                                                  {completedBooks.includes(
                                                    book._id
                                                  ) && (
                                                    <div className="absolute top-0 right-0 bg-purple-500 text-white p-1 rounded-bl-md">
                                                      <Check size={16} />
                                                    </div>
                                                  )}
                                                  {currentlyReading.includes(
                                                    book._id
                                                  ) && (
                                                    <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl-md">
                                                      <BookOpen size={16} />
                                                    </div>
                                                  )}
                                                  {tbrBooks.includes(
                                                    book._id
                                                  ) && (
                                                    <div className="absolute top-0 right-0 bg-blue-500 text-white p-1 rounded-bl-md">
                                                      <BookMarked size={16} />
                                                    </div>
                                                  )}
                                                  {dnfBooks.includes(
                                                    book._id
                                                  ) && (
                                                    <div className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md">
                                                      <X size={16} />
                                                    </div>
                                                  )}

                                                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                </div>
                                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                <div className="opacity-0 group-hover:opacity-100 absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-amber-800 p-2 rounded shadow-md transition-opacity w-32 z-10">
                                                  <p className="font-medium text-amber-200 text-xs text-center">
                                                    {book.title}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="w-16 sm:w-20 h-40 rounded-sm bg-gray-300 shadow-md flex justify-center items-center">
                                            <span className="text-xs text-gray-600">
                                              No books
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reading Area */}
                      <div className="lg:w-1/3 flex flex-col">
                        {/* Currently Reading Section */}
                        <div className="relative bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-6 shadow-lg border border-amber-700 mb-6">
                          <h2 className="text-xl font-semibold text-amber-100 mb-4">
                            Currently Reading
                          </h2>
                          {currentlyReadingBooks.length === 0 ? (
                            <p className="text-amber-300">
                              No books marked as currently reading
                            </p>
                          ) : (
                            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {currentlyReadingBooks.map((book) => (
                                <div key={book._id} className="mb-4">
                                  <Link href={`/books/${book._id}`}>
                                    <div className="flex items-center gap-3 bg-amber-900 p-2 rounded hover:bg-amber-800 transition-colors shadow-sm hover:shadow border-l-4 border-green-500">
                                      <div className="w-12 h-16 bg-amber-200 rounded-sm shadow overflow-hidden">
                                        <img
                                          src={book.coverImageUrl}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="font-medium text-amber-100">
                                          {book.title}
                                        </h3>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleCompleted(book._id);
                                          }}
                                          className="p-1 rounded-full bg-amber-700 hover:bg-amber-600 transition-colors"
                                          title="Mark as read"
                                        >
                                          <Check size={16} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleCurrentlyReading(book._id);
                                          }}
                                          className="p-1 rounded-full bg-amber-700 hover:bg-amber-600 transition-colors"
                                          title="Remove from currently reading"
                                        >
                                          <BookOpen size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Completed Books Section */}
                        <div className="relative bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-6 shadow-lg border border-amber-700 mb-6">
                          <h2 className="text-xl font-semibold text-amber-100 mb-4">
                            Completed Books
                          </h2>
                          {completedBooksList.length === 0 ? (
                            <p className="text-amber-300">
                              No books marked as completed
                            </p>
                          ) : (
                            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {completedBooksList.map((book) => (
                                <Link
                                  href={`/books/${book._id}`}
                                  key={book._id}
                                >
                                  <div className="flex items-center gap-3 bg-amber-900 p-2 rounded hover:bg-amber-800 transition-colors shadow-sm hover:shadow border-l-4 border-purple-500 mb-3">
                                    <div className="w-12 h-16 bg-amber-200 rounded-sm shadow overflow-hidden">
                                      <img
                                        src={book.coverImageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium text-amber-100">
                                        {book.title}
                                      </h3>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleCompleted(book._id);
                                      }}
                                      className="p-1 rounded-full bg-amber-700 hover:bg-amber-600 transition-colors"
                                      title="Mark as unread"
                                    >
                                      <Check size={16} />
                                    </button>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* TBR Preview Section */}
                        <div className="relative bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-6 shadow-lg border border-amber-700 mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-amber-100">
                              TBR Jar ({tbrBooksList.length})
                            </h2>

                            <button
                              onClick={() => setShowTbrJar(true)}
                              className="text-amber-200 hover:text-amber-100 underline"
                            >
                              View All
                            </button>
                          </div>
                          {tbrBooksList.length === 0 ? (
                            <p className="text-amber-300">
                              No books in your TBR jar
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2 justify-center">
                              {tbrBooksList.slice(0, 5).map((book) => (
                                <div
                                  key={book._id}
                                  className="w-12 h-16 bg-amber-200 rounded-sm shadow overflow-hidden border-2 border-blue-400"
                                >
                                  <img
                                    src={book.coverImageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {tbrBooksList.length > 5 && (
                                <div className="flex items-center justify-center w-12 h-16 bg-amber-900 rounded-sm shadow border-2 border-blue-400">
                                  <p className="text-amber-100 font-bold">
                                    +{tbrBooksList.length - 5}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reading Stats */}
                        <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg p-4 shadow-lg border border-amber-700 max-h-[500px] overflow-y-auto custom-scrollbar">
                          <h2 className="text-xl font-semibold text-amber-100 mb-3 sticky top-0 bg-gradient-to-br from-amber-800 to-amber-900 py-1 z-10">
                            Reading Stats
                          </h2>

                          <div className="space-y-4">
                            

                            {/* Books Summary Section */}
                            <div className="grid grid-cols-4 gap-2 text-center border-b border-amber-700 pb-3">
                              <div>
                                <p className="text-amber-400 text-xs">
                                  Library
                                </p>
                                <p className="text-xl text-amber-100">
                                  {books.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-amber-400 text-xs">
                                  Reading
                                </p>
                                <p className="text-xl text-amber-100">
                                  {currentlyReading.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-amber-400 text-xs">
                                  Completed
                                </p>
                                <p className="text-xl text-amber-100">
                                  {completedBooks.length}
                                </p>
                              </div>
                              <div>
                                <p className="text-amber-400 text-xs">DNF</p>
                                <p className="text-xl text-amber-100">
                                  {dnfBooks.length}
                                </p>
                              </div>
                            </div>

                            {/* Currently Reading */}
                            <div className="pb-2">
                              <p className="text-amber-400 text-sm font-medium mb-2">
                                Currently Reading
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {currentlyReadingBooks.map((book) => (
                                  <div
                                    key={`reading-${book._id}`}
                                    className="flex items-center gap-1 bg-amber-900/50 p-1 rounded-md w-full border-l-2 border-green-400"
                                    title={book.title}
                                  >
                                    <div className="w-6 h-8 flex-shrink-0">
                                      <img
                                        src={book.coverImageUrl}
                                        alt=""
                                        className="w-full h-full object-cover rounded-sm"
                                      />
                                    </div>
                                    <span className="text-amber-200 text-xs truncate flex-1">
                                      {book.title}
                                    </span>
                                  </div>
                                ))}
                                {currentlyReadingBooks.length === 0 && (
                                  <p className="text-amber-300/70 text-xs italic">
                                    No books currently being read
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Completed */}
                            <div className="pb-2">
                              <p className="text-amber-400 text-sm font-medium mb-2">
                                Completed
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {completedBooksList.map((book) => (
                                  <div
                                    key={`completed-${book._id}`}
                                    className="flex items-center gap-1 bg-amber-900/50 p-1 rounded-md w-full border-l-2 border-purple-400"
                                    title={book.title}
                                  >
                                    <div className="w-6 h-8 flex-shrink-0">
                                      <img
                                        src={book.coverImageUrl}
                                        alt=""
                                        className="w-full h-full object-cover rounded-sm"
                                      />
                                    </div>
                                    <span className="text-amber-200 text-xs truncate flex-1">
                                      {book.title}
                                    </span>
                                  </div>
                                ))}
                                {completedBooksList.length === 0 && (
                                  <p className="text-amber-300/70 text-xs italic">
                                    No completed books yet
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* TBR Jar */}
                            <div className="pb-2">
                              <p className="text-amber-400 text-sm font-medium mb-2">
                                TBR Jar
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {tbrBooksList.map((book) => (
                                  <div
                                    key={`tbr-${book._id}`}
                                    className="flex items-center gap-1 bg-amber-900/50 p-1 rounded-md w-full border-l-2 border-blue-400"
                                    title={book.title}
                                  >
                                    <div className="w-6 h-8 flex-shrink-0">
                                      <img
                                        src={book.coverImageUrl}
                                        alt=""
                                        className="w-full h-full object-cover rounded-sm"
                                      />
                                    </div>
                                    <span className="text-amber-200 text-xs truncate flex-1">
                                      {book.title}
                                    </span>
                                  </div>
                                ))}
                                {tbrBooksList.length === 0 && (
                                  <p className="text-amber-300/70 text-xs italic">
                                    Your TBR jar is empty
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* DNF Books */}
                            <div className="pb-2">
                              <p className="text-amber-400 text-sm font-medium mb-2">
                                Did Not Finish
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {books
                                  .filter((book) => dnfBooks.includes(book._id))
                                  .map((book) => (
                                    <div
                                      key={`dnf-${book._id}`}
                                      className="flex items-center gap-1 bg-amber-900/50 p-1 rounded-md w-full border-l-2 border-red-400"
                                      title={book.title}
                                    >
                                      <div className="w-6 h-8 flex-shrink-0">
                                        <img
                                          src={book.coverImageUrl}
                                          alt=""
                                          className="w-full h-full object-cover rounded-sm"
                                        />
                                      </div>
                                      <span className="text-amber-200 text-xs truncate flex-1">
                                        {book.title}
                                      </span>
                                    </div>
                                  ))}
                                {books.filter((book) =>
                                  dnfBooks.includes(book._id)
                                ).length === 0 && (
                                  <p className="text-amber-300/70 text-xs italic">
                                    No DNF books
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Book Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-amber-900 border border-amber-700 rounded-lg max-w-md w-full shadow-2xl">
            <BookReview
              bookId={currentBookForReview}
              onClose={() => {
                setShowReviewModal(false);
                setCurrentBookForReview("");
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-amber-900 border border-amber-700 rounded-lg p-6 max-w-xl w-full shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowUploadModal(false);
                fetchPdfFiles();
              }}
              className="absolute top-2 right-2 text-amber-100 hover:text-white text-xl"
            >
              <X />
            </button>

            <UploadPdf />
          </div>
        </div>
      )}

      {/* TBR Jar Modal */}
      {showTbrJar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-amber-900 border border-amber-700 rounded-lg p-6 max-w-xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowTbrJar(false)}
              className="absolute top-2 right-2 text-amber-100 hover:text-white text-xl"
            >
              <X />
            </button>

            <TbrJar
              books={tbrBooksList}
              onSelect={(book) => {
                toggleCurrentlyReading(book._id);
                setShowTbrJar(false);
                router.push(`/books/${book._id}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-amber-900 border border-amber-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-amber-100 mb-4">
              Delete Book
            </h3>
            <p className="text-amber-200 mb-6">
              Are you sure you want to delete this book? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBook(deleteConfirmation)}
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {bookOptionsModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-gradient-to-br from-amber-950 to-amber-900 border border-amber-700/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative"
            style={{ maxHeight: "90vh", overflow: "auto" }}
          >
            {/* Close button (X) positioned at the top-right */}
            <button
              onClick={() =>
                setBookOptionsModal({
                  isOpen: false,
                  bookId: "",
                  bookTitle: "",
                })
              }
              className="absolute top-3 right-3 text-amber-400 hover:text-amber-200 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Book details header */}
            <div className="mb-6 border-b border-amber-700/40 pb-4">
              <h3 className="text-xl font-semibold text-amber-100">
                {bookOptionsModal.bookTitle}
              </h3>
              <p className="text-amber-400/80 text-sm">Select an option</p>
            </div>

            {/* Action buttons organized into categories */}
            <div className="space-y-4">
              {/* Reading status options */}
              <div className="space-y-2">
                <h4 className="text-amber-400 text-sm font-medium">
                  Reading Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      toggleCurrentlyReading(bookOptionsModal.bookId);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                      currentlyReading.includes(bookOptionsModal.bookId)
                        ? "bg-green-600/80 hover:bg-green-500 text-white ring-2 ring-green-400"
                        : "bg-amber-800/80 hover:bg-amber-700 text-amber-100"
                    }`}
                  >
                    <BookOpen size={16} />
                    <span className="truncate">
                      {currentlyReading.includes(bookOptionsModal.bookId)
                        ? "Stop Reading"
                        : "Currently Reading"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      toggleCompleted(bookOptionsModal.bookId);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                      completedBooks.includes(bookOptionsModal.bookId)
                        ? "bg-purple-600/80 hover:bg-purple-500 text-white ring-2 ring-purple-400"
                        : "bg-amber-800/80 hover:bg-amber-700 text-amber-100"
                    }`}
                  >
                    <Check size={16} />
                    <span className="truncate">
                      {completedBooks.includes(bookOptionsModal.bookId)
                        ? "Unmark Completed"
                        : "Mark Completed"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      toggleTbr(bookOptionsModal.bookId);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                      tbrBooks.includes(bookOptionsModal.bookId)
                        ? "bg-blue-600/80 hover:bg-blue-500 text-white ring-2 ring-blue-400"
                        : "bg-amber-800/80 hover:bg-amber-700 text-amber-100"
                    }`}
                  >
                    <BookMarked size={16} />
                    <span className="truncate">
                      {tbrBooks.includes(bookOptionsModal.bookId)
                        ? "Remove from TBR"
                        : "Add to TBR"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      toggleDnf(bookOptionsModal.bookId);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${
                      dnfBooks.includes(bookOptionsModal.bookId)
                        ? "bg-red-600/80 hover:bg-red-500 text-white ring-2 ring-red-400"
                        : "bg-amber-800/80 hover:bg-amber-700 text-amber-100"
                    }`}
                  >
                    <X size={16} />
                    <span className="truncate">
                      {dnfBooks.includes(bookOptionsModal.bookId)
                        ? "Remove DNF Status"
                        : "Did Not Finish"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="text-amber-400 text-sm font-medium">Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      router.push(`/books/${bookOptionsModal.bookId}`);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className="p-2 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <BookAIcon size={16} />
                    <span className="truncate">Read</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentBookForReview(bookOptionsModal.bookId);
                      setShowReviewModal(true);
                      setBookOptionsModal({
                        isOpen: false,
                        bookId: "",
                        bookTitle: "",
                      });
                    }}
                    className="p-2 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <Star size={16} />
                    <span className="truncate">Rate & Review</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-2 pt-2 border-t border-amber-700/40">
                <h4 className="text-red-400 text-sm font-medium flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Danger Zone
                </h4>
                <button
                  onClick={() => {
                    setDeleteConfirmation(bookOptionsModal.bookId);
                    setBookOptionsModal({
                      isOpen: false,
                      bookId: "",
                      bookTitle: "",
                    });
                  }}
                  className="w-full p-2 bg-red-900/50 hover:bg-red-700 text-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  <span>Delete Book</span>
                </button>
              </div>

              {/* Footer buttons */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() =>
                    setBookOptionsModal({
                      isOpen: false,
                      bookId: "",
                      bookTitle: "",
                    })
                  }
                  className="px-4 py-2 bg-amber-700/60 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
