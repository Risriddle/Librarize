"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Book, BookOpen, List, X ,MessageCircleMore,CalendarDays,Star,Brain} from "lucide-react";

interface NavbarProps {
  onSearch?: (searchTerm: string) => void;
  onShowUploadModal?: () => void;
  onShowTbrJar?: () => void;
  searchTerm?: string;
  isHomePage?: boolean; 
}

export default function Navbar({
  onSearch,
  onShowUploadModal,
  onShowTbrJar,
  searchTerm = "",
  isHomePage = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };


  const renderHomePageFeatures = () => {
    if (!isHomePage) return null;
    
    return (
      <>
        {/* Search Bar */}
        <div className="relative flex-grow max-w-xs">
          <input
            type="text"
            placeholder="Search books..."
            className="w-full px-4 py-2 bg-amber-800/50 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-100 pl-10"
            value={localSearchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-amber-400 h-5 w-5" />
        </div>

        {/* Action Buttons */}
        <button
          onClick={onShowUploadModal}
          className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
        >
          <Book size={18} className="mr-2" />
          <span>Add Book</span>
        </button>

        <button
          onClick={onShowTbrJar}
          className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
        >
          <BookOpen size={18} className="mr-2" />
          <span>TBR Jar</span>
        </button>


       
      </>
    );
  };
  
  // Also update the mobile menu features
  const renderMobileHomePageFeatures = () => {
    if (!isHomePage) return null;
    
    return (
      <>
        <div className="relative">
          <input
            type="text"
            placeholder="Search books..."
            className="w-full px-4 py-2 bg-amber-800/50 border border-amber-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-100 pl-10"
            value={localSearchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-amber-400 h-5 w-5" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onShowUploadModal}
            className="flex flex-col items-center justify-center p-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition duration-200"
          >
            <Book size={24} className="mb-1" />
            <span className="text-xs">Add Book</span>
          </button>

          <button
            onClick={onShowTbrJar}
            className="flex flex-col items-center justify-center p-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition duration-200"
          >
            <BookOpen size={24} className="mb-1" />
            <span className="text-xs">TBR Jar</span>
          </button>

          
          
        </div>
      </>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-amber-900 to-amber-950 shadow-lg sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-amber-400 shadow-md transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/images/spellbook.png"
                  alt="i love books"
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-200 transition-all duration-300 group-hover:text-amber-100">
                Librarize
              </h1>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-amber-200 hover:text-amber-100 focus:outline-none p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
<div className="hidden md:flex items-center space-x-4">
  {/* Conditionally render home page features */}
  {renderHomePageFeatures()}

  {/* Always show these navigation links */}
  <Link
    href="/all-vocab"
    className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
  >
    <span className="mr-2"><Brain/></span>
    <span>All Vocab</span>
  </Link>

  <Link
    href="/all-quotes"
    className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
  >
    <span className="mr-2"><MessageCircleMore/></span>
    <span>All Quotes</span>
  </Link>

  <Link
    href="/all-ratings"
    className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
  >
    <span className="mr-2"><Star/></span>
    <span>All Reviews/Ratings</span>
  </Link>

  <Link
    href="/booktracker"
    className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
  >
    <span className="mr-2"><CalendarDays/></span>
    <span>Tracker</span>
  </Link>

  
</div>



      {/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="md:hidden pt-4 pb-2 border-t border-amber-800 mt-3 flex flex-col space-y-3">
    {/* Conditionally render home page features */}
    {renderMobileHomePageFeatures()}

    {/* Always show these navigation links */}
    <div className="grid grid-cols-3 gap-2">
      <Link
        href="/all-vocab"
        className="flex flex-col items-center justify-center p-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition duration-200"
      >
        <span className="text-lg mb-1"><Brain/></span>
        <span className="text-xs">All Vocab</span>
      </Link>

      <Link
        href="/all-quotes"
        className="flex flex-col items-center justify-center p-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition duration-200"
      >
        <span className="text-lg mb-1"><MessageCircleMore/></span>
        <span className="text-xs">All Quotes</span>
      </Link>

      <Link
    href="/all-ratings"
    className="flex items-center px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-md transition duration-200 shadow-md"
  >
    <span className="mr-2"><Star/></span>
    <span>All Reviews/Ratings</span>
  </Link>
      <Link
        href="/booktracker"
        className="flex flex-col items-center justify-center p-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-md transition duration-200"
      >
        <span className="text-lg mb-1"><CalendarDays/></span>
        <span className="text-xs">Tracker</span>
      </Link>
    </div>
  </div>
)}
</div>
      </div>

      {/* Decorative element - bookshelf texture line */}
      <div className="h-1 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 shadow-inner"></div>
    </nav>
  );
}
