"use client";
import { useState, useEffect, useRef } from "react";
import {
  Star,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Edit,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
interface Book {
  _id: string;
  title: string;
  author: string;
  rating: number;
  review: string;
  coverImageUrl: string;
}

export default function BookReviewsList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "title" | "author">("rating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBookSelectionModalOpen, setIsBookSelectionModalOpen] =
    useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loadingAvailableBooks, setLoadingAvailableBooks] = useState(false);

  // Virtual scrolling refs
  const bookListRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: booksPerPage,
  });

  // Form state for adding/editing reviews
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
  });

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/pdf-files");
        const data = await response.json();
        console.log("Fetched books:", data);

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        setBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Unable to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle scroll events for virtual scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (bookListRef.current) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const containerTop = bookListRef.current.offsetTop;
        const containerHeight = window.innerHeight;

        const itemHeight = 300; // Approximate height of each card
        const buffer = 3; // Buffer items above and below

        const firstVisibleItem = Math.max(
          0,
          Math.floor((scrollTop - containerTop) / itemHeight) - buffer
        );
        const visibleItems =
          Math.ceil(containerHeight / itemHeight) + 2 * buffer;

        setVisibleRange({
          start: firstVisibleItem,
          end: firstVisibleItem + visibleItems,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSort = (sortType: "rating" | "title" | "author") => {
    if (sortBy === sortType) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortType);
      setSortDirection("desc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open book selection modal to add a new review
  const openAddModal = async () => {
    setLoadingAvailableBooks(true);
    try {
      const response = await fetch("/api/pdf-files");
      if (!response.ok) {
        throw new Error("Failed to fetch available books");
      }
      const data = await response.json();
      setAvailableBooks(data);
      setIsBookSelectionModalOpen(true);
    } catch (err) {
      console.error("Error fetching available books:", err);
      alert("Unable to load available books. Please try again.");
    } finally {
      setLoadingAvailableBooks(false);
    }
  };

  // Select a book and open the review modal
  const selectBookForReview = (book: Book) => {
    setCurrentBook(book);
    setReviewForm({
      rating: book.rating || 0,
      review: book.review || "",
    });
    setIsBookSelectionModalOpen(false);
    setIsModalOpen(true);
  };

  // Open edit modal for an existing book
  const openEditModal = (book: Book) => {
    setCurrentBook(book);
    setReviewForm({
      rating: book.rating,
      review: book.review,
    });
    setIsModalOpen(true);
  };

  // Open a modal to read the full review
  const openReviewModal = (book: Book) => {
    setCurrentBook(book);
    setIsReviewModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsReviewModalOpen(false);
    setIsBookSelectionModalOpen(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleRatingClick = (rating: number) => {
    // If clicking on the same rating value, toggle it off
    if (reviewForm.rating === rating) {
      setReviewForm((prev) => ({
        ...prev,
        rating: 0,
      }));
    } else {
      setReviewForm((prev) => ({
        ...prev,
        rating: rating,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBook) {
      alert("No book selected");
      return;
    }

    try {
      const pdfId = currentBook._id;
      const url = `/api/ratings?pdfId=${pdfId}`;

      // Always use PUT since we're updating existing books
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        throw new Error("Failed to save review");
      }

      const savedBook = await response.json();

      // Update existing book in state
      setBooks((prev) => {
        // Check if book already exists in our displayed list
        const bookExists = prev.some((book) => book._id === pdfId);

        if (bookExists) {
          // Update the existing book
          return prev.map((book) =>
            book._id === pdfId
              ? {
                  ...book,
                  rating: reviewForm.rating,
                  review: reviewForm.review,
                }
              : book
          );
        } else {
          // Add as a new book to the list
          return [...prev, savedBook];
        }
      });

      closeModal();
    } catch (err) {
      console.error("Error saving review:", err);
      alert("Unable to save your review. Please try again.");
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "rating") {
      return sortDirection === "asc"
        ? a.rating - b.rating
        : b.rating - a.rating;
    } else if (sortBy === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortDirection === "asc"
        ? a.author.localeCompare(b.author)
        : b.author.localeCompare(a.author);
    }
  });

  // Pagination logic (for non-virtual scrolling backup)
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

  // For virtual scrolling - prepare all items but only render visible ones
  const visibleBooks = sortedBooks.slice(
    visibleRange.start,
    Math.min(visibleRange.end, sortedBooks.length)
  );

  // Calculate whether to show full star, half star, or empty star
  const getStarType = (position: number, currentRating: number) => {
    const fullStarValue = Math.floor(position);
    const halfStarValue = fullStarValue - 0.5;

    if (currentRating >= position) {
      return "full";
    } else if (currentRating >= halfStarValue && halfStarValue > 0) {
      return "half";
    } else {
      return "empty";
    }
  };
  // Render stars based on rating
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((starPosition) => {
          // Determine if this position should show full, half, or empty star
          const starType = getStarType(starPosition, rating);

          return (
            <div
              key={starPosition}
              className={`relative ${interactive ? "cursor-pointer" : ""}`}
            >
              {/* Star container */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className="relative w-6 h-6">
                  {/* Base empty star */}
                  <Star size={24} className="text-amber-300 fill-transparent" />

                  {/* Overlay filled star (half or full) */}
                  {starType !== "empty" && (
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        starType === "half" ? "w-[52%]" : "w-full"
                      } overflow-hidden`}
                    >
                      <Star
                        size={24}
                        className="text-amber-400 fill-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Interactive areas for half-star selection */}
                {interactive && (
                  <>
                    {/* Left half - for half star */}
                    <div
                      className="absolute inset-y-0 left-0 w-1/2 z-10"
                      onClick={() => handleRatingClick(starPosition - 0.5)}
                    />

                    {/* Right half - for full star */}
                    <div
                      className="absolute inset-y-0 right-0 w-1/2 z-10"
                      onClick={() => handleRatingClick(starPosition)}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-amber-950 text-amber-200">
        <div className="text-xl text-amber-400">{error}</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-amber-100 text-amber-800">
      <Navbar isHomePage={false} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="bg-amber-100 rounded-lg border border-amber-100 p-4 mb-8 shadow-md">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="text-amber-800 mr-3" size={28} />
              <h1 className="text-2xl font-serif text-amber-800 font-semibold">
                My Book Reviews
              </h1>
            </div>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-amber-400"
              />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-amber-50 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-800 w-full lg:w-80"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <Filter size={16} className="mr-2 text-amber-800" />
                <span className="text-amber-800 mr-2">Sort by:</span>
              </div>

              <button
                onClick={() => toggleSort("title")}
                className={`flex items-center px-3 py-1 rounded-md border text-amber-50 ${
                  sortBy === "title"
                    ? "bg-amber-700 border-amber-500"
                    : "bg-amber-800 border-amber-800"
                } hover:bg-amber-600 transition-colors`}
              >
                Title
                {sortBy === "title" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </button>

              <button
                onClick={() => toggleSort("author")}
                className={`flex items-center px-3 py-1 rounded-md border text-amber-50 ${
                  sortBy === "author"
                    ? "bg-amber-700 border-amber-500"
                    : "bg-amber-800 border-amber-800"
                } hover:bg-amber-600 transition-colors`}
              >
                Author
                {sortBy === "author" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </button>

              <button
                onClick={() => toggleSort("rating")}
                className={`flex items-center px-3 py-1 rounded-md border text-amber-50${
                  sortBy === "rating"
                    ? "bg-amber-700 border-amber-500"
                    : "bg-amber-800 border-amber-800"
                } hover:bg-ambconspiracyer-600 transition-colors`}
              >
                <Star size={16} className="mr-1" />
                Rating
                {sortBy === "rating" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </button>
              <button
                onClick={openAddModal}
                className="bg-amber-800 hover:bg-amber-600 text-amber-100 py-2 px-4 rounded-md flex items-center transition-colors shadow-md"
              >
                <Plus size={18} className="mr-2" />
                Add New Review
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-amber-900/30 rounded-lg border border-amber-800">
            <p className="text-amber-300 text-lg">
              No books found matching your search.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 bg-amber-700 hover:bg-amber-600 text-amber-100 py-2 px-4 rounded-md transition-colors shadow-md"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div ref={bookListRef} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-amber-900/30 rounded-lg border border-amber-800 overflow-hidden hover:border-amber-700 transition-colors shadow-md flex flex-col h-full cursor-pointer group"
                  onClick={() => openReviewModal(book)}
                >
                  {/* Book Cover */}
                  <div className="relative pt-[60%] overflow-hidden bg-amber-950">
                    <img
                      src={book.coverImageUrl}
                      alt={`Cover of ${book.title}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        openEditModal(book);
                      }}
                    >
                      <button className="bg-amber-800/80 hover:bg-amber-700 p-2 rounded-full shadow-md transition-colors">
                        <Edit size={16} className="text-amber-100" />
                      </button>
                    </div>
                  </div>

                  {/* Book Content */}
                  <div className="p-4 flex-grow flex flex-col bg-amber-800">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold text-amber-300 line-clamp-1">
                        {book.title}
                      </h2>
                      <div className="flex flex-col items-center">
                        {renderStars(book.rating)}
                        {book.rating > 0 && (
                          <span className="text-amber-400 text-sm mt-1">
                            {book.rating} stars
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-amber-400 text-sm mb-3">
                      by {book.author}
                    </p>

                    <div className="flex-grow">
                      <p className="text-amber-100 text-sm line-clamp-3">
                        {book.review}
                      </p>

                      <div className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center">
                        Read full review{" "}
                        <ChevronDown size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-amber-800/50 text-amber-500 cursor-not-allowed"
                        : "bg-amber-800 hover:bg-amber-700 text-amber-200"
                    }`}
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-amber-500">...</span>
                          )}

                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md ${
                              currentPage === page
                                ? "bg-amber-600 text-amber-100"
                                : "bg-amber-800 hover:bg-amber-700 text-amber-200"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-amber-800/50 text-amber-500 cursor-not-allowed"
                        : "bg-amber-800 hover:bg-amber-700 text-amber-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-8 p-4 bg-amber-800 rounded-lg border border-amber-800 text-center">
              <p className="text-amber-300">
                Showing {Math.min(filteredBooks.length, indexOfFirstBook + 1)}-
                {Math.min(indexOfLastBook, filteredBooks.length)} of{" "}
                {filteredBooks.length}
                {filteredBooks.length !== books.length && ` filtered`} books
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Book Selection Modal */}
      {isBookSelectionModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-800 p-4">
              <h2 className="text-xl font-semibold text-amber-200">
                Select a Book to Review
              </h2>
              <button
                onClick={closeModal}
                className="text-amber-400 hover:text-amber-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {loadingAvailableBooks ? (
                <div className="text-center py-8">
                  <p className="text-amber-300">Loading available books...</p>
                </div>
              ) : (
                <>
                  {availableBooks.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-amber-300 text-lg">
                        No books available to review.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableBooks.map((book) => (
                        <div
                          key={book._id}
                          onClick={() => selectBookForReview(book)}
                          className="flex items-center gap-3 p-3 border border-amber-800 rounded-lg hover:bg-amber-800/50 cursor-pointer"
                        >
                          <div className="w-12 h-16 flex-shrink-0 bg-amber-950">
                            {book.coverImageUrl && (
                              <img
                                src={book.coverImageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <h3 className="font-medium text-amber-300 truncate">
                              {book.title}
                            </h3>
                            <p className="text-sm text-amber-400 truncate">
                              by {book.author}
                            </p>
                          </div>
                          {book.rating > 0 && (
                            <div className="flex-shrink-0">
                              {renderStars(book.rating)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Review Modal */}
      {isModalOpen && currentBook && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-800 p-4">
              <h2 className="text-xl font-semibold text-amber-200">
                {currentBook.review ? "Edit Review" : "Add Review"}
              </h2>
              <button
                onClick={closeModal}
                className="text-amber-400 hover:text-amber-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Book Info (non-editable) */}
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-amber-800">
                <div className="w-20 h-28 flex-shrink-0 bg-amber-950">
                  {currentBook.coverImageUrl && (
                    <img
                      src={currentBook.coverImageUrl}
                      alt={`Cover of ${currentBook.title}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-amber-300">
                    {currentBook.title}
                  </h3>
                  <p className="text-amber-400">by {currentBook.author}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-300 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center">
                      {renderStars(reviewForm.rating, true)}
                      <input
                        type="hidden"
                        name="rating"
                        value={reviewForm.rating}
                      />
                      <span className="ml-2 text-amber-200">
                        {reviewForm.rating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-amber-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      name="review"
                      value={reviewForm.review}
                      onChange={handleFormChange}
                      rows={8}
                      required
                      className="w-full px-4 py-2 bg-amber-950 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-100 resize-y"
                      placeholder="What did you think about this book?"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mr-2 px-4 py-2 border border-amber-700 text-amber-300 rounded-md hover:bg-amber-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 text-amber-100 rounded-md hover:bg-amber-600 transition-colors shadow-md"
                  >
                    {currentBook.review ? "Update Review" : "Save Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Full Review Modal */}
      {isReviewModalOpen && currentBook && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-800 p-4">
              <h2 className="text-xl font-semibold text-amber-200">
                Book Review
              </h2>
              <button
                onClick={closeModal}
                className="text-amber-400 hover:text-amber-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    src={currentBook.coverImageUrl}
                    alt={`Cover of ${currentBook.title}`}
                    className="w-full max-w-xs mx-auto rounded-md shadow-md border border-amber-700"
                  />

                  <div className="mt-4 text-center">
                    <div className="flex justify-center mb-2">
                      {renderStars(currentBook.rating)}
                    </div>
                    <button
                      onClick={() => {
                        closeModal();
                        openEditModal(currentBook);
                      }}
                      className="mt-2 inline-flex items-center text-amber-400 hover:text-amber-300"
                    >
                      <Edit size={16} className="mr-1" /> Edit review
                    </button>
                  </div>
                </div>

                {/* Book Details and Review */}
                <div className="md:w-2/3">
                  <h1 className="text-2xl font-serif font-bold text-amber-300 mb-1">
                    {currentBook.title}
                  </h1>
                  <p className="text-amber-400 text-lg mb-6">
                    by {currentBook.author}
                  </p>

                  <h3 className="text-lg font-medium text-amber-300 mb-3">
                    My Review
                  </h3>
                  <div className="bg-amber-950/50 p-4 rounded-md border border-amber-800">
                    <p className="text-amber-100 whitespace-pre-line">
                      {currentBook.review || "No review yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
     
    </div>
    <Footer />
    </>
  );
}
