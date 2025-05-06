

"use client";
import { useState, useEffect, useRef } from "react";
import Container from "@/components/ui/Container";
import Navbar from "@/components/Navbar";
import Text from "@/components/ui/Text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Download,
  Share2,
  Search,
  Book,
  Trash,
  Quote as QuoteIcon,
  FileDown,
  Bookmark,
  Library,
  Coffee,
  Star,
  StarHalf,
  Filter,
} from "lucide-react";
import { saveAs } from "file-saver";
import axios from "axios";
import { jsPDF } from "jspdf";
import Footer from "@/components/Footer";

interface Quote {
  _id: string;
  text: string;
  note: string;
  pdfId: string;
  createdAt: string;
}

interface PDFInfo {
  _id: string;
  fileName: string;
  title: string;
  author: string;
  rating: number;
  coverImageUrl: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const quotesContainerRef = useRef<HTMLDivElement>(null);

  const fetchPdfFiles = async () => {
    try {
      const response = await axios.get("/api/pdf-files");
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="inline-block"
          size={16}
          fill="#F59E0B"
          color="#F59E0B"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="inline-block"
          size={16}
          fill="#F59E0B"
          color="#F59E0B"
        />
      );
    }

    // Add empty stars to make it always 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-star-${i}`}
          className="inline-block"
          size={16}
          color="#F59E0B"
        />
      );
    }

    return stars;
  };

  useEffect(() => {
    fetchPdfFiles();
  }, []);

  useEffect(() => {
    if (selectedPdf) {
      fetchQuotes(selectedPdf);
    }
  }, [selectedPdf]);

  const fetchQuotes = async (pdfId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes?pdfId=${pdfId}`);
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes?id=${quoteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchQuotes(selectedPdf!);
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
    }
  };

  const downloadQuotesAsTxt = () => {
    if (!quotes.length) return;

    const pdfTitle =
      pdfs.find((pdf) => pdf._id === selectedPdf)?.title || "quotes";
    const fileName = `${pdfTitle
      .toLowerCase()
      .replace(/\s+/g, "-")}-quotes.txt`;

    const content = quotes
      .map((quote) => {
        return `"${quote.text}"\n${
          quote.note ? `Note: ${quote.note}\n` : ""
        }\n`;
      })
      .join("---\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  };

  const downloadQuotesAsPdf = () => {
        if (!quotes.length) return;
    
        const doc = new jsPDF();
        const pdfTitle =
          pdfs.find((pdf) => pdf._id === selectedPdf)?.title || "quotes";
        const fileName = `${pdfTitle
          .toLowerCase()
          .replace(/\s+/g, "-")}-quotes.pdf`;
    
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(120, 76, 40); // Brown color
        doc.text(`Quotes from "${pdfTitle}"`, 20, 20);
    
        // Add quotes
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
    
        let yPosition = 30;
        quotes.forEach((quote, index) => {
          // New page check
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        
          // Reset styles for quote
          doc.setFontSize(12);
          doc.setFont("times", "italic");
          doc.setTextColor(60, 35, 20);
        
          const quoteText = `"${quote.text}"`;
          const splitQuote = doc.splitTextToSize(quoteText, 170);
          doc.text(splitQuote, 20, yPosition);
        
          yPosition += 6 * splitQuote.length;
        
          // Note if exists
          if (quote.note) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            const noteText = `Note: ${quote.note}`;
            const splitNote = doc.splitTextToSize(noteText, 160);
            doc.text(splitNote, 25, yPosition);
            yPosition += 6 * splitNote.length;
          }
        
          // Date
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            new Date(quote.createdAt).toLocaleDateString(),
            20,
            yPosition + 3
          );
        
          // Separator
          if (index < quotes.length - 1) {
            yPosition += 6;
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;
          }
        });
        
        doc.save(fileName);
      };

  const shareToWhatsApp = (quoteText: string, note?: string) => {
    const pdfTitle =
      pdfs.find((pdf) => pdf._id === selectedPdf)?.title || "book";
    const shareText = `"${quoteText}" - from ${pdfTitle}${
      note ? `\n\nNote: ${note}` : ""
    }`;
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareAllQuotesToWhatsApp = () => {
    if (!quotes.length || !selectedPdf) return;

    const pdfTitle =
      pdfs.find((pdf) => pdf._id === selectedPdf)?.title || "book";
    const shareText =
      `Quotes from "${pdfTitle}":\n\n` +
      quotes
        .map((q) => `"${q.text}"${q.note ? `\nNote: ${q.note}` : ""}`)
        .join("\n\n");

    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  

  const filteredQuotes = quotes.filter(
    (q) =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.note && q.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredBooks = pdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      pdf.author.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amber-100">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-800/10 to-transparent pointer-events-none"></div>
      <Navbar isHomePage={false} />
      
      <Container className="py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Library className="w-8 h-8 text-amber-800 mr-3" />
            <h1 className="text-3xl font-serif text-amber-900">
              My Reading Quotes
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              disabled={!selectedPdf || quotes.length === 0}
              onClick={downloadQuotesAsPdf}
              variant="secondary"
              className="bg-amber-800 hover:bg-amber-900 text-amber-50"
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              disabled={!selectedPdf || quotes.length === 0}
              onClick={downloadQuotesAsTxt}
              variant="secondary"
              className="border-amber-800 text-amber-800 hover:bg-amber-100"
            >
              <Download className="w-4 h-4 mr-2" />
              TXT
            </Button>
            <Button
              disabled={!selectedPdf || quotes.length === 0}
              onClick={shareAllQuotesToWhatsApp}
              variant="link"
              className="bg-green-600 hover:bg-green-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-200px)] gap-6">
          {/* Fixed-width scrollable sidebar for books */}
          <div className="w-72 flex-shrink-0">
            <Card className="h-full bg-amber-200 border-amber-200 shadow-md overflow-hidden flex flex-col">
              <div className="p-4 border-b border-amber-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif font-semibold text-lg text-amber-900">
                    My Bookshelf
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-800 p-1"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search bar for books */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-700 w-4 h-4" />
                  <Input
                    className="pl-9 text-amber-800 bg-amber-50/80 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    placeholder="Search books..."
                    value={bookSearchTerm}
                    onChange={(e) => setBookSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Scrollable book list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="grid grid-cols-2 gap-3">
                  {filteredBooks.map((pdf) => (
                    <div
                      key={pdf._id}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedPdf === pdf._id
                          ? "scale-105"
                          : "hover:scale-105"
                      }`}
                      onClick={() => setSelectedPdf(pdf._id)}
                    >
                      <div
                        className={`relative aspect-[3/4] flex items-center justify-center rounded-md shadow-md overflow-hidden
                        ${
                          selectedPdf === pdf._id ? "ring-2 ring-amber-500" : ""
                        }`}
                      >
                        {pdf.coverImageUrl ? (
                          <img
                            src={pdf.coverImageUrl}
                            alt={pdf.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-amber-200 to-amber-300 flex items-center justify-center">
                            <Book className="w-10 h-10 text-amber-700" />
                          </div>
                        )}
                        {selectedPdf === pdf._id && (
                          <div className="absolute top-0 right-0">
                            <Bookmark className="w-6 h-6 text-amber-600 fill-amber-600" />
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 rounded-lg shadow-md p-3 flex flex-col hover:shadow-lg transition-shadow">
                        <div className="flex-1 min-w-0">
                          {/* Title with truncation */}
                          <h3 className="text-sm font-medium text-amber-900 truncate">
                            {pdf.title}
                          </h3>

                          {/* Author with truncation */}
                          <p className="text-xs text-amber-800 mt-1 truncate">
                            by {pdf.author}
                          </p>

                          {/* Rating as stars */}
                          <div className="flex items-center mt-2">
                            <div className="flex">
                              {renderStars(pdf.rating)}
                            </div>
                            <span className="ml-1 text-xs text-amber-700">
                              {pdf.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Flexible width main content area for quotes */}
          <div className="flex-1">
            {selectedPdf ? (
              <div className="relative h-full">
                <div className="bg-[url('/images/paper-texture.jpg')] bg-cover rounded-lg p-6 shadow-lg border border-amber-200 h-full flex flex-col overflow-hidden">
                  {/* Coffee stain decoration */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-800/10 rounded-full blur-md"></div>
                  <div className="absolute top-6 right-6">
                    <Coffee className="w-6 h-6 text-amber-800/20" />
                  </div>

                  {/* Header with search */}
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="font-serif text-2xl text-amber-900 flex items-center">
                      <QuoteIcon className="w-6 h-6 text-amber-700 mr-2" />
                      Saved Quotes
                      {pdfs.find((p) => p._id === selectedPdf) && (
                        <span className="ml-2 text-sm text-amber-700 italic">
                          from &quot;{pdfs.find((p) => p._id === selectedPdf)?.title}&quot;
                        </span>
                      )}
                    </h2>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-700 w-4 h-4" />
                      <Input
                        className="pl-9 text-amber-800 bg-amber-50/80 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="Search quotes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Scrollable quotes container */}
                  {isLoading ? (
                    <div className="text-center py-16 flex-1 flex flex-col justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <Text className="text-amber-700">Turning pages...</Text>
                    </div>
                  ) : (
                    <div 
                      ref={quotesContainerRef}
                      className="flex-1 overflow-y-auto custom-scrollbar pr-2"
                    >
                      {filteredQuotes.length > 0 ? (
                        <div className="space-y-6">
                          {filteredQuotes.map((quote) => (
                            <div
                              key={quote._id}
                              className="relative transform transition-all duration-300 hover:scale-[1.01]"
                            
                            >
                              <div className="p-6 bg-amber-50/90 border border-amber-200 rounded shadow-md quote-card">
                                <div className="flex">
                                  <QuoteIcon className="w-5 h-5 text-amber-700 mr-3 flex-shrink-0 mt-1" />
                                  <div className="flex-1">
                                    <Text className="text-lg italic mb-2 font-serif text-amber-900">
                                      &quot;{quote.text}&quot;
                                    </Text>
                                    {quote.note && (
                                      <Text className="text-amber-700 text-sm mt-3 pl-3 border-l-2 border-amber-300 italic">
                                        {quote.note}
                                      </Text>
                                    )}
                                    <div className="flex justify-between items-center mt-4">
                                      <Text className="text-xs text-amber-600">
                                        {new Date(
                                          quote.createdAt
                                        ).toLocaleDateString()}
                                      </Text>
                                      <div className="flex space-x-2">
                                       
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={() =>
                                            shareToWhatsApp(quote.text, quote.note)
                                          }
                                        >
                                          <Share2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => deleteQuote(quote._id)}
                                        >
                                          <Trash className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Decorative pins */}
                              <div className="absolute -top-2 -left-0 w-3 h-3 rounded-full bg-amber-800 shadow-md"></div>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-800 shadow-md"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                          <Book className="w-16 h-16 text-amber-300 mb-4" />
                          <Text className="text-amber-700 italic font-serif text-lg">
                            {searchTerm
                              ? "No matching quotes found."
                              : "No quotes saved for this book yet."}
                          </Text>
                          <Text className="text-amber-600 text-sm mt-2">
                            {searchTerm
                              ? "Try a different search term."
                              : "Add your first quote using the form."}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-amber-50/50 rounded-lg border-2 border-dashed border-amber-300">
                <div className="relative">
                  <Book className="w-16 h-16 text-amber-300 mb-4" />
                  <div className="absolute -top-1 -right-2 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-800">
                      {pdfs.length}
                    </span>
                  </div>
                </div>
                <Text className="text-amber-700 italic font-serif text-lg">
                  Select a book to view quotes
                </Text>
                <Text className="text-amber-600 text-sm mt-2">
                  Your collected wisdom will appear here
                </Text>

                {/* Decorative bookmarks */}
                <div className="flex mt-6 space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 w-3 rounded-t-md bg-gradient-to-b ${
                        i === 0
                          ? "from-red-400 to-red-500"
                          : i === 1
                          ? "from-amber-400 to-amber-500"
                          : "from-emerald-400 to-emerald-500"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Add some custom CSS for scrollbars and quote styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9f2e8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4a76a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b38d5e;
        }
        
        /* Styling for quote cards when downloaded as image */
        .quote-card {
          position: relative;
          background-image: linear-gradient(to bottom right, rgba(255,251,235,0.95), rgba(254,243,199,0.95));
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .quote-card::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          width: calc(100% - 20px);
          height: calc(100% - 20px);
          border: 1px dashed rgba(146, 64, 14, 0.2);
          border-radius: 6px;
          pointer-events: none;
        }
      `}</style>
      <Footer/>
    </div>
  );
}
