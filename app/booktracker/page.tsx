

"use client"
import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Star, StarHalf } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Book type definition
interface Book {
  _id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  rating: number;
  
}

// Month's books type
interface MonthBooks {
  [month: string]: Book[];
}

const BookItem = ({ book, onDragEnd }: { book: Book, onDragEnd?: (book: Book) => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BOOK',
    item: book,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ month: string, book: Book }>();
      if (item && dropResult && onDragEnd) {
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

 
  return drag(
    
    <div 
      className={`flex items-center p-2 border-b border-amber-200 cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      <img 
        src={book.coverImageUrl || "/api/placeholder/60/90"} 
        alt={book.title} 
        className="w-10 h-16 object-cover mr-3 rounded shadow-sm"
      />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-amber-800 line-clamp-1">{book.title}</h4>
        <p className="text-xs text-gray-600">{book.author}</p>
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => {
            if (i < Math.floor(book.rating)) {
              return <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
            } else if (i < Math.ceil(book.rating) && book.rating % 1 !== 0) {
              return <StarHalf key={i} size={12} className="text-amber-500 fill-amber-500" />
            } else {
              return <Star key={i} size={12} className="text-gray-300" />
            }
          })}
        </div>
      </div>
    </div>
  );
};

const MonthCalendar = ({ month, books, handleEdit, onDrop, onRemoveBook }: { 
  month: string, 
  books: Book[], 
  handleEdit: (month: string) => void,
  onDrop: (book: Book, month: string) => Promise<void>,
  onRemoveBook: (month: string, bookId: string) => void,
  selectedYear: number
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BOOK',
    drop: (item: Book) => {
      onDrop(item, month);
      return { month, book: item };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div
      className={`bg-amber-200 rounded-lg shadow-md overflow-hidden transition transform hover:scale-105 hover:shadow-lg ${
        isOver ? 'ring-2 ring-amber-600' : ''
      }`}
    >
      <div className="bg-amber-800 text-white py-3 px-4">
        <h3 className="text-xl font-bold">{month}</h3>
      </div>
      
      {/* Books list */}
      <div className="p-4 min-h-48 max-h-48 overflow-y-auto">
        {books && books.length > 0 ? (
          <ul className="space-y-2">
            {books.map((book, index) => (
              <li key={index} className="flex items-center space-x-2 group">
                <img 
                  src={book.coverImageUrl || "/api/placeholder/30/45"} 
                  alt={book.title} 
                  className="w-6 h-9 object-cover rounded shadow-sm"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium line-clamp-1 text-amber-800">{book.title}</p>
                  <p className="text-xs text-amber-600 line-clamp-1">{book.author}</p>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      if (i < Math.floor(book.rating)) {
                        return <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
                      } else if (i < Math.ceil(book.rating) && book.rating % 1 !== 0) {
                        return <StarHalf key={i} size={10} className="text-amber-500 fill-amber-500" />
                      } else {
                        return <Star key={i} size={10} className="text-gray-300" />
                      }
                    })}
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveBook(month, book._id)}
                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No books added</p>
            <p>Drag and drop from sidebar!</p>
          </div>
        )}
      </div>
      
      <div className="bg-amber-100 px-4 py-2 border-t border-amber-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </span>
        <button
          onClick={() => handleEdit(month)}
          className="text-amber-600 hover:text-amber-800 text-sm font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default function BookTracker() {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  const [booksPerMonth, setBooksPerMonth] = useState<MonthBooks>({});
  const [isAddingBooks, setIsAddingBooks] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [bookInputs, setBookInputs] = useState<Book[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch books from API - simplified since ratings are included
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        // Fetch books from the API - ratings are already included
        const response = await fetch('/api/pdf-files');
        const data = await response.json();
        
        // No need for separate rating fetches
        setAvailableBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setAvailableBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  const fetchAllMonthlyBooks = async () => {
    try {
      const response = await fetch(`/api/monthly-books?year=${selectedYear}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly books');
      }
      const data = await response.json();
      console.log(data,"monthly bookssssssssss")
      // No need to fetch ratings separately
      setBooksPerMonth(data);
    } catch (error) {
      console.error('Error fetching all books:', error);
    }
  };
  
  useEffect(() => {
    fetchAllMonthlyBooks();
  }, [selectedYear]);
  
  const handleAddBook = () => {
    setIsAddingBooks(true);
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    // Make sure to use the latest data from booksPerMonth
    setBookInputs(booksPerMonth[month] || []);
  };

  const saveBooksToAPI = async (month: string, books: Book[]) => {
    try {
      const response = await fetch('/api/monthly-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, books, year: selectedYear }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save monthly books');
      }
  
      console.log(`Books for ${month} saved successfully!`);
    } catch (error) {
      console.error('Error saving monthly books:', error);
    }
  };

  const removeBooksFromAPI = async (month: string, bookId: string) => {
    try {
      const response = await fetch(`/api/monthly-books/${month}/${bookId}?year=${selectedYear}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, bookId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete monthly books');
      }
  
      console.log(`Book for ${month} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting monthly books:', error);
    }
  };
  
  const saveBooks = async () => {
    const updatedBooks = {
      ...booksPerMonth,
      [selectedMonth]: bookInputs,
    };
  
    setBooksPerMonth(updatedBooks);
    await saveBooksToAPI(selectedMonth, bookInputs);
  
    setIsAddingBooks(false);
    setSelectedMonth('');
    setBookInputs([]);
  };

  const cancelAddBooks = () => {
    setIsAddingBooks(false);
    setSelectedMonth('');
    setBookInputs([]);
  };

  const handleDrop = async (book: Book, month: string) => {
    // Check if book already exists in the month
    const existingBooks = booksPerMonth[month] || [];
    const bookExists = existingBooks.some(b => b._id === book._id);
    
    if (!bookExists) {
      // No need to fetch rating again, just use the book as is
      const allMonthBooks = [...existingBooks, book];
      
      // Update state with ALL books for this month
      setBooksPerMonth(prevState => ({
        ...prevState,
        [month]: allMonthBooks
      }));
      
      // Save ALL books for this month to API
      await saveBooksToAPI(month, allMonthBooks);
      fetchAllMonthlyBooks();
    }
  };

  const removeBookFromMonth = (month: string, bookId: string) => {
    if (booksPerMonth[month]) {
      removeBooksFromAPI(month, bookId);
      setBooksPerMonth({
        ...booksPerMonth,
        [month]: booksPerMonth[month].filter(book => book._id !== bookId)
      });
    }
  };

  const addBookToMonth = (book: Book) => {
    if (selectedMonth) {
      // Check if book already exists in the month
      const existingBooks = bookInputs || [];
      const bookExists = existingBooks.some(b => b._id === book._id);
      
      if (!bookExists) {
        // No need to fetch the rating, use the book directly
        setBookInputs([...existingBooks, book]);
      }
    }
  };

  const removeBookFromSelection = (bookId: string) => {
    setBookInputs(bookInputs.filter(book => book._id !== bookId));
  };

  const filteredBooks = availableBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <Navbar isHomePage={false}/>
    <DndProvider backend={HTML5Backend}>
      <div className="bg-amber-100 min-h-screen">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className={`bg-amber-200 border-r border-amber-200 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
            <div className="p-4 border-b border-amber-200">
              <h2 className="text-xl font-bold text-amber-800">Book Library</h2>
              <div className="mt-2">
                <input 
                  type="text" 
                  placeholder="Search books..." 
                  className="w-full px-3 py-2 text-amber-800 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
                </div>
              ) : (
                <div className="divide-y divide-amber-200">
                  {filteredBooks.map((book) => (
                    <BookItem 
                      key={book._id} 
                      book={book} 
                      onDragEnd={undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <header className="mb-6 flex items-center">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 text-amber-700 hover:text-amber-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">My Reading Journal</h1>
                  <p className="text-gray-600">Track your reading journey throughout the year</p>
                </div>
              </header>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="bg-amber-700 text-white p-1 rounded hover:bg-amber-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-bold text-amber-800">{selectedYear}</span>
                  <button 
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="bg-amber-700 text-white p-1 rounded hover:bg-amber-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>


              {/* Add Book Button */}
              {!isAddingBooks && (
                <div className="mb-8 flex justify-center">
                  <button
                    onClick={handleAddBook}
                    className="bg-amber-700 hover:bg-amber-600 text-amber-200 font-medium py-2 px-6 rounded-lg shadow-md transition flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Books
                  </button>
                </div>
              )}

              {/* Book Adding Modal */}
              {isAddingBooks && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-amber-100 text-black rounded-lg shadow-xl p-6 w-full max-w-lg">
                    <h2 className="text-2xl font-bold mb-4 text-amber-700">Add Books</h2>
                    
                    {!selectedMonth ? (
                      <div>
                        <p className="mb-4 text-gray-600">Select a month to add books:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {months.map((month) => (
                            <button
                              key={month}
                              onClick={() => handleMonthSelect(month)}
                              className="bg-amber-200 hover:bg-amber-300 text-gray-800 py-2 px-3 rounded transition"
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={cancelAddBooks}
                            className="bg-amber-200 hover:bg-amber-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-amber-600">{selectedMonth}</h3>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Drag & drop books from the sidebar or select from the list below:</p>
                          
                          {/* Current books in month */}
                          <div className="max-h-48 overflow-y-auto mb-4 bg-white p-3 rounded-lg">
                          
                            {bookInputs.length > 0 ? (
                              <div className="space-y-2">
                                {bookInputs.map((book, index) => (
                                  <div key={index} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                                    <div className="flex items-center">
                                      <img 
                                        src={book.coverImageUrl || "/api/placeholder/30/45"} 
                                        alt={book.title} 
                                        className="w-8 h-12 object-cover rounded shadow-sm mr-2"
                                      />
                                      <div>
                                        <p className="font-medium text-sm">{book.title}</p>
                                        <p className="text-xs text-gray-600">{book.author}</p>
                                        <div className="flex items-center mt-1">
                                          {Array.from({ length: 5 }).map((_, i) => {
                                            if (i < Math.floor(book.rating)) {
                                              return <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
                                            } else if (i < Math.ceil(book.rating) && book.rating % 1 !== 0) {
                                              return <StarHalf key={i} size={10} className="text-amber-500 fill-amber-500" />
                                            } else {
                                              return <Star key={i} size={10} className="text-gray-300" />
                                            }
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeBookFromSelection(book._id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-400 py-4">No books selected</p>
                            )}
                          </div>
                          
                          {/* Available books quick select */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Books:</h4>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {filteredBooks.slice(0, 6).map((book) => (
                                <button
                                  key={book._id}
                                  onClick={() => addBookToMonth(book)}
                                  className="flex items-center text-left bg-amber-50 hover:bg-amber-100 p-2 rounded"
                                >
                                  <img 
                                    src={book.coverImageUrl || "/api/placeholder/30/45"} 
                                    alt={book.title} 
                                    className="w-6 h-9 object-cover rounded shadow-sm mr-2"
                                  />
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-medium truncate">{book.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                    <div className="flex items-center mt-1">
                                      {Array.from({ length: 5 }).map((_, i) => {
                                        if (i < Math.floor(book.rating)) {
                                          return <Star key={i} size={10} className="text-amber-500 fill-amber-500" />
                                        } else if (i < Math.ceil(book.rating) && book.rating % 1 !== 0) {
                                          return <StarHalf key={i} size={10} className="text-amber-500 fill-amber-500" />
                                        } else {
                                          return <Star key={i} size={10} className="text-gray-300" />
                                        }
                                      })}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={cancelAddBooks}
                            className="bg-amber-200 hover:bg-amber-300 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveBooks}
                            className="bg-amber-700 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calendar Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month) => (
                  <MonthCalendar
                    key={month}
                    month={month}
                    books={booksPerMonth[month] || []}
                    handleEdit={() => {
                      setIsAddingBooks(true);
                      handleMonthSelect(month);
                    }}
                    onDrop={handleDrop}
                    onRemoveBook={removeBookFromMonth}
                    selectedYear={selectedYear}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
    <Footer/>
    </>
  );
}