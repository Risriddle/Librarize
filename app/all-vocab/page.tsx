
"use client"
import { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import Text from '@/components/ui/Text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from "axios";
import Navbar from '@/components/Navbar';
import { jsPDF } from "jspdf";
import { Book,Plus, Download, Search, Share2, Trash, BookOpen, Bookmark, Coffee, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import Footer from '@/components/Footer';

interface Vocab {
  _id: string;
  word: string;
  meaning: string;
  pdfId: string;
}

interface PDFInfo {
  _id: string;
  fileName: string;
  title:string;
  coverImageUrl: string;
}

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<Vocab[]>([]);
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPdfFiles = async () => {
    try {
      const response = await axios.get("/api/pdf-files");
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    }
  }

  useEffect(() => {
    fetchPdfFiles();
  }, []);

  useEffect(() => {
    if (selectedPdf) {
      fetchVocabulary(selectedPdf);
    }
  }, [selectedPdf]);

  const fetchVocabulary = async (pdfId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vocab?pdfId=${pdfId}`);
      const data = await response.json();
      setVocabulary(data);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const deleteVocab = async (vocabId: string) => {
    try {
      const response = await fetch(`/api/vocab?id=${vocabId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchVocabulary(selectedPdf!);
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
    }
  };

  const downloadVocabularyAsPDF = () => {
    if (!vocabulary.length || !selectedPdf) return;
    
    const pdfTitle = pdfs.find(pdf => pdf._id === selectedPdf)?.title|| 'Vocabulary';
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(120, 76, 40); // Brown color
    doc.text(`Vocabulary List for "${pdfTitle}"`, 20, 20);
    
    // Add words and meanings
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 35;
    vocabulary.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Word
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 76, 40);
      doc.text(item.word, 20, yPosition);
      
      // Meaning
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const meaningText = item.meaning;
      const splitMeaning = doc.splitTextToSize(meaningText, 170);
      doc.text(splitMeaning, 20, yPosition + 7);
      
      yPosition += 15 + (splitMeaning.length - 1) * 7;
      
      // Line separator
      if (index < vocabulary.length - 1) {
        doc.setDrawColor(200, 180, 160);
        doc.line(20, yPosition - 3, 190, yPosition - 3);
        yPosition += 7;
      }
    });
    
    doc.save(`${pdfTitle.toLowerCase().replace(/\s+/g, '-')}-vocabulary.pdf`);
  };

  const downloadVocabularyAsCSV = () => {
    if (!vocabulary.length || !selectedPdf) return;
    
    const pdfTitle = pdfs.find(pdf => pdf._id === selectedPdf)?.title || 'vocabulary';
    const fileName = `${pdfTitle.toLowerCase().replace(/\s+/g, '-')}-vocabulary.csv`;
    
    const csvContent = [
      'Word,Meaning',
      ...vocabulary.map(item => `"${item.word}","${item.meaning}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, fileName);
  };

  const shareWordOnWhatsApp = (word: string, meaning: string) => {
    const text = encodeURIComponent(`Word: ${word}\nMeaning: ${meaning}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredVocabulary = vocabulary.filter(
    v => v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
         v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBooks = pdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) 
  );

  return (
    <div className="min-h-screen bg-amber-100">
      <div className="absolute top-0 left-0 right-0 h-32 bg-amber-800/10 -z-10"></div>
      <Navbar isHomePage={false}/>
      <Container className="py-8">
        {/* Header with book icon */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="mr-4 p-3 bg-amber-200 rounded-full shadow-md">
              <BookOpen className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-amber-900">My Vocabulary</h1>
              <p className="text-amber-700 text-sm italic mt-1">Build your personal word collection</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              disabled={!selectedPdf || vocabulary.length === 0}
              onClick={downloadVocabularyAsPDF}
              variant="secondary"
              className="bg-amber-800 hover:bg-amber-900 text-amber-50"
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              disabled={!selectedPdf || vocabulary.length === 0}
              onClick={downloadVocabularyAsCSV}
              variant="secondary"
              className="border-amber-800 text-amber-400 hover:bg-amber-100"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - Scrollable Book Collection */}
          <div className="md:col-span-1">
            <Card className="p-4 bg-amber-200 border-amber-200 shadow-md overflow-hidden relative h-[calc(100vh-220px)]">
              {/* Decorative coffee stain */}
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <div className="w-24 h-24 rounded-full bg-amber-900"></div>
              </div>
              
              <div className="sticky top-0 bg-amber-200 z-10 pb-2 space-y-3">
                <div className="flex items-center">
                  <Coffee className="w-5 h-5 text-amber-700 mr-2" />
                  <h3 className="font-serif font-semibold text-amber-900">My Reading Collection</h3>
                </div>
                
                {/* Book search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-800 w-4 h-4" />
                  <Input
                    className="pl-9 bg-amber-50/70 border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-full text-amber-800 text-sm"
                    placeholder="Search books..."
                    onChange={(e) => setBookSearchTerm(e.target.value)}
                    value={bookSearchTerm}
                  />
                </div>
              </div>
              
              {/* Scrollable book grid */}
              <div className="overflow-y-auto h-[calc(100%-40px)] pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  {filteredBooks.map(pdf => (
                    <div 
                      key={pdf._id}
                      className={`cursor-pointer transition-all duration-300 mb-3 ${
                        selectedPdf === pdf._id ? 'scale-105' : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedPdf(pdf._id)}
                    >
                      <div className={`relative aspect-[3/4] flex items-center justify-center rounded-md shadow-md overflow-hidden
                        ${selectedPdf === pdf._id ? 'ring-2 ring-amber-500' : ''}`}
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
                          <div className="absolute top-1 right-1">
                            <Bookmark className="w-5 h-5 text-amber-600 fill-amber-600" />
                          </div>
                        )}
                      </div>
                     
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right content area */}
          <div className="md:col-span-2">
            {selectedPdf ? (
              <div className="relative h-[calc(100vh-220px)]">
                <Card className="ml-6 overflow-hidden shadow-lg border-0 h-full flex flex-col">
                  {/* Book header */}
                  <div className="bg-amber-700 p-4 border-b flex items-center sticky top-0 z-10">
                    <BookOpen className="w-5 h-5 mr-2 text-amber-100" />
                    <h2 className="font-serif font-semibold text-amber-50">
                      {pdfs.find(p => p._id === selectedPdf)?.title|| 'Selected Book'}
                    </h2>
                  </div>
                  
                  {/* Paper-like content area */}
                  <div className="bg-[#fff8b8] p-6 flex-1 overflow-hidden flex flex-col" style={{ 
                    backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgGAAABXklEQVR4nN3VW3aDIBRGYUTAgOhAqFoN3v8ui9Ca0RhHXbr51woHNtuDCnDOOeecc84555xzrgrglRpQYiJCCCMnViKEMHIh0CZhpkRXrIiZEEsibcImfSLbRDYJ9YmoTiQbdDshsknWJbJP4hPJJtEmPFUi2iTY5LVPZJuEScImcZd8J5JNpIbICN0nYZPoi2CbRLPJKxG6ImuI6Q6RDrjGCDkhNEpoNoFdQiOEHiXcKmEniaCE5YTKBLcKD8Q+JnEkvgrET8OZ+DIQ1gVhXRAqCZWE5oRKwrIgVBAWBrER8MdmIT4QHMVCECsvEd4pYkG8WYgPhfxP1j7Z+qT1CfXJWidxnbR18tZJXyd5nfR1ImVS10ldJ3WdyJzkedLmSZsndZ7kdTLnyc9D1nlC8wTnCc8TnidhnvA8ofOE50nME5omeZrkaRJSEzFNaJrQNMFpgvMkzBO+Pg84f8Wcc84594MffuKqOusoYXIAAAAASUVORK5CYII=')",
                    boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.05)"
                  }}>
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#fff8b8] z-10 pb-2">
                      <h3 className="font-serif font-medium text-amber-900">Words Collection</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-800 w-4 h-4" />
                        <Input
                          className="pl-9 bg-amber-200/50 border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-full text-amber-800"
                          placeholder="Search words..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Scrollable vocabulary area */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                      {isLoading ? (
                        <div className="text-center py-16">
                          <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <Text className="text-amber-700">Finding words...</Text>
                        </div>
                      ) : filteredVocabulary.length > 0 ? (
                        <div className="space-y-2 mt-4">
                          {filteredVocabulary.map((item, index) => (
                            <Card key={item._id} className={`p-3 bg-transparent border-b border-amber-200 border-dashed 
                              hover:bg-amber-50/50 transition-colors ${
                              index === filteredVocabulary.length - 1 ? 'border-b-0' : ''
                            }`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <Text className="font-serif font-semibold text-amber-900">{item.word}</Text>
                                  <Text className="text-amber-700 font-serif italic">{item.meaning}</Text>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-green-600 hover:text-green-800 hover:bg-amber-100"
                                    onClick={() => shareWordOnWhatsApp(item.word, item.meaning)}
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => deleteVocab(item._id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-amber-100"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-amber-50/50 rounded-lg border-2 border-dashed border-amber-200">
                          <Book className="w-12 h-12 mx-auto text-amber-300 mb-2" />
                          <Text className="text-amber-700 font-serif">
                            {searchTerm ? 'No matching words found.' : 'No vocabulary words saved for this book yet.'}
                          </Text>
                          <Text className="text-amber-600 text-sm mt-2 max-w-md mx-auto">
                            {searchTerm ? 'Try a different search term.' : 'Add your first word using the form on the left.'}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                
                {/* Page edge effect */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-amber-200 to-transparent"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] bg-amber-50/50 rounded-lg border-2 border-dashed border-amber-300">
                <div className="mb-6 relative">
                  <Book className="w-16 h-16 text-amber-300" />
                  <div className="absolute -bottom-2 -right-2 bg-amber-100 rounded-full p-2 shadow-sm">
                    <Plus className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
                <Text className="text-amber-700 font-serif text-lg mb-2">Select a book to view vocabulary</Text>
                <Text className="text-amber-600 text-sm max-w-md text-center">
                  Your personal word collection will appear here, making it easy to remember new words from your readings
                </Text>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(217, 119, 6, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(217, 119, 6, 0.3);
          border-radius: 10px;
          border: 2px solid rgba(217, 119, 6, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(217, 119, 6, 0.5);
        }
      `}</style>
      <Footer/>
    </div>
    
  );
}