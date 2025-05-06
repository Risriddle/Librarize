"use client";

import "@react-pdf-viewer/core/lib/styles/index.css";
import { useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  MessageCircleMore,
  Brain,
  BookMarked,
  BookmarkCheck,
  BookHeart,
  Quote,
  Moon,
  Sun,
  Timer,
} from "lucide-react";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { X } from "lucide-react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout/lib";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  pdfId: string;
};

type VocabEntry = {
  _id: string;
  word: string;
  meaning: string;
  pdfId: string;
};

type QuoteEntry = {
  _id: string;
  text: string;
  note: string;
  pdfId: string;
  createdAt: string;
  pageIndex: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
};

type BookmarkEntry = {
  _id: string;
  pageIndex: number;
  label: string;
  pdfId: string;
};

type Phonetic = {
  text?: string;
  audio?: string;
};


const ViewPdf = ({ url, pdfId }: Props) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Core states
  const [currentPage, setCurrentPage] = useState(0);
  const [selectionMode, setSelectionMode] = useState<"vocab" | "quote">(
    "vocab"
  );

  const [timerDuration, setTimerDuration] = useState(120); // Default 2 hours in minutes
  const [timeRemaining, setTimeRemaining] = useState(timerDuration * 60); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Vocabulary states
  const [selectedWord, setSelectedWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [vocabList, setVocabList] = useState<VocabEntry[]>([]);

  // Quote states
  const [selectedQuote, setSelectedQuote] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);
  const [quotesList, setQuotesList] = useState<QuoteEntry[]>([]);
  const [selectionPosition, setSelectionPosition] = useState<unknown>(null);

  // Bookmark states
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);

  // Apply highlight effect for quotes
  useEffect(() => {
    // Give PDF time to render
    const applyHighlights = setTimeout(() => {
      const pages = document.querySelectorAll(".rpv-core__page-layer");

      pages.forEach((page, pageIndex) => {
        // Create or select highlight container inside each page
        let highlightContainer = page.querySelector(".highlight-container");
        if (!highlightContainer) {
          highlightContainer = document.createElement("div");
          highlightContainer.className =
            "highlight-container absolute top-0 left-0 w-full h-full pointer-events-none";
          page.appendChild(highlightContainer);
        }

        // Clear existing highlights for this page to prevent duplicates
        highlightContainer.innerHTML = "";

        // Add highlights for this page
        quotesList
          .filter((quote) => quote.pageIndex === pageIndex)
          .forEach((quote) => {
            if (!quote.position) return;

            const highlightDiv = document.createElement("div");
            highlightDiv.id = `highlight-${quote._id}`;
            highlightDiv.style.position = "absolute";
            highlightDiv.style.left = `${quote.position.x}px`;
            highlightDiv.style.top = `${quote.position.y}px`;
            highlightDiv.style.width = `${quote.position.width}px`;
            highlightDiv.style.height = `${quote.position.height}px`;
            highlightDiv.style.backgroundColor = quote.color || "#FFEB3B";
            highlightDiv.style.opacity = "0.35";
            highlightDiv.style.zIndex = "1";
            highlightDiv.style.pointerEvents = "none";

            highlightContainer.appendChild(highlightDiv);
          });
      });
    }, 300);

    return () => clearTimeout(applyHighlights);
  }, [currentPage, quotesList]);

  // Load initial data
  useEffect(() => {
    fetchVocabForPdf();
    fetchQuotesForPdf();
    fetchBookmarks();
    loadLastPosition();
  }, [pdfId]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = async () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      if (!text) return;

      // Skip if modals are already open
      if (showDictionaryModal || showQuoteModal) return;

      if (selectionMode === "vocab" && text.split(/\s+/).length === 1) {
        // Handle vocabulary selection
        setSelectedWord(text);
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`
          );
          const data = await res.json();

          if (res.ok && data[0]) {
            setMeaning(
              data[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
                "No definition found"
            );
            // setAudioUrl(
            //   data[0]?.phonetics?.find((p:any) => p.audio)?.audio || ""
            // );
            const phonetics: Phonetic[] = data[0]?.phonetics || [];
            const audio = phonetics.find((p) => p.audio)?.audio || "";
            setAudioUrl(audio);
            
            
          } else {
            setMeaning("Definition not found");
            setAudioUrl("");
          }
          setShowDictionaryModal(true);
        } catch (err) {
          setMeaning("Error fetching definition");
          setShowDictionaryModal(true);
          console.log(err)
        }
      } else if (selectionMode === "quote") {
        // Handle quote selection
        setSelectedQuote(text);

        // Get position of selection
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Store position relative to the viewer
          const container = document.querySelector(".rpv-core__viewer");
          if (container) {
            const containerRect = container.getBoundingClientRect();

            setSelectionPosition({
              x: rect.left - containerRect.left,
              y: rect.top - containerRect.top,
              width: rect.width,
              height: rect.height,
            });

            setQuoteNote("");
            setShowQuoteModal(true);
          }
        }
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [selectionMode, showDictionaryModal, showQuoteModal]);

  useEffect(() => {
    // Create audio element for alarm
    alarmAudioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
    );
    alarmAudioRef.current.loop = true;

    return () => {
      // Clean up timer and audio when component unmounts
      if (timerRef.current) clearInterval(timerRef.current);
      if (alarmAudioRef.current) alarmAudioRef.current.pause();
    };
  }, []);

  // Add this useEffect to handle timer countdown
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time is up
            clearInterval(timerRef.current!);
            setIsTimerActive(false);
            // Play alarm sound
            if (alarmAudioRef.current) {
              alarmAudioRef.current.play();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isTimerActive && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timeRemaining]);

  // Add these helper functions for the timer
  const startTimer = () => {
    setIsTimerActive(true);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeRemaining(timerDuration * 60);
  };

  const stopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Add this function to update timer duration
  const updateTimerDuration = (minutes: number) => {
    setTimerDuration(minutes);
    setTimeRemaining(minutes * 60);
  };

  // Save vocabulary
  const saveVocabulary = async () => {
    try {
      const res = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: selectedWord, meaning, pdfId }),
      });

      if (res.ok) {
        setShowDictionaryModal(false);
        await fetchVocabForPdf();
      }
      if (res.status === 409) {
        // Word already exists
        alert("This word is already saved.");
      }
    } catch (error) {
      console.error("Error saving vocabulary:", error);
    }
  };

  // Save quote with position and color
  const saveQuote = async () => {
    try {
      const quoteData = {
        text: selectedQuote,
        note: quoteNote,
        pdfId,
        pageIndex: currentPage + 1,
        position: selectionPosition,
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });

      if (res.ok) {
        const newQuote = await res.json();
        // Add the new quote to the current list for immediate display
        setQuotesList((prev) => [...prev, newQuote]);
        setShowQuoteModal(false);
      }
    } catch (error) {
      console.error("Error saving quote:", error);
    }
  };

  // Save bookmark
  const saveBookmark = async () => {
    const newBookmark = {
      pageIndex: currentPage,
      label: bookmarkLabel || `Page ${currentPage + 1}`,
      pdfId,
    };

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBookmark),
      });

      if (res.ok) {
        const savedBookmark = await res.json();
        setBookmarks((prev) => [...prev, savedBookmark]);
        setShowBookmarkModal(false);
        setBookmarkLabel("");

        // Also save locally
        saveBookmarksToLocalStorage([...bookmarks, savedBookmark]);
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  // Data fetching functions
  const fetchVocabForPdf = async () => {
    try {
      const res = await fetch(`/api/vocab?pdfId=${pdfId}`);
      if (res.ok) {
        const data = await res.json();
        setVocabList(data);
      }
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
    }
  };

  const fetchQuotesForPdf = async () => {
    try {
      const res = await fetch(`/api/quotes?pdfId=${pdfId}`);
      if (res.ok) {
        const data = await res.json();
        setQuotesList(data);
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`/api/bookmarks?pdfId=${pdfId}`);
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
        saveBookmarksToLocalStorage(data);
      } else {
        // If API fails, try local storage
        loadBookmarksFromLocalStorage();
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      loadBookmarksFromLocalStorage();
    }
  };

  // Local storage helpers
  const saveBookmarksToLocalStorage = (bookmarks: BookmarkEntry[]) => {
    localStorage.setItem(`bookmarks-${pdfId}`, JSON.stringify(bookmarks));
  };

  const loadBookmarksFromLocalStorage = () => {
    const saved = localStorage.getItem(`bookmarks-${pdfId}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const saveLastPosition = (pageIndex: number) => {
    localStorage.setItem(`pdf-position-${pdfId}`, pageIndex.toString());
  };

  const loadLastPosition = () => {
    const savedPosition = localStorage.getItem(`pdf-position-${pdfId}`);
    if (savedPosition) {
      const pageIndex = parseInt(savedPosition, 10);
      setCurrentPage(pageIndex);
    }
  };

  // Fixed and improved jumpToQuote function
  const jumpToQuote = (quote: QuoteEntry) => {
    // First navigate to the correct page
    pageNavigationPluginInstance.jumpToPage(quote.pageIndex);
    setCurrentPage(quote.pageIndex);
    saveLastPosition(quote.pageIndex);

    // Then scroll to the quote position after a delay to ensure page is loaded
    setTimeout(() => {
      const viewer = document.querySelector(".rpv-core__viewer");
      const pageLayer = document.querySelector(
        `[data-page-number="${quote.pageIndex + 1}"] .rpv-core__page-layer`
      );

      if (viewer && pageLayer) {
        const pageRect = pageLayer.getBoundingClientRect();
        const viewerRect = viewer.getBoundingClientRect();

        // Calculate the scroll position
        const scrollTop =
          pageRect.top - viewerRect.top + quote.position.y - 100; // -100 for some padding

        // Smooth scroll to the position
        viewer.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });

        // Flash the highlight temporarily for better visibility
        const highlight = document.querySelector(`#highlight-${quote._id}`);
        if (highlight) {
          highlight.classList.add("flash-highlight");
          setTimeout(() => {
            highlight.classList.remove("flash-highlight");
          }, 1500);
        }
      }
    }, 500); // Increased timeout for better reliability
  };

  // Navigation helpers
  const jumpToPage = (pageIndex: number) => {
    pageNavigationPluginInstance.jumpToPage(pageIndex);
    setCurrentPage(pageIndex);
    saveLastPosition(pageIndex);
  };

  return (
    <div className="relative h-[90vh] w-full p-4 bg-amber-100">
      {/* Top toolbar */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={() =>
              setSelectionMode((prev) => (prev === "vocab" ? "quote" : "vocab"))
            }
            className={`px-4 py-2 rounded mr-2 ${
              selectionMode === "quote"
                ? "bg-amber-800 hover:bg-amber-700 text-white"
                : "bg-amber-800 hover:bg-amber-700 text-white"
            }`}
          >
            {selectionMode === "quote" ? (
              <>
                <Quote className="inline-block w-4 h-4 mr-1" /> Quote Mode
              </>
            ) : (
              <>
                <BookHeart className="inline-block w-4 h-4 mr-1" /> Vocab Mode
              </>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowBookmarkModal(true)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-500 text-sm flex items-center transition-colors"
          >
            <span className="mr-1">
              <BookmarkCheck />
            </span>{" "}
            Bookmark
          </button>
          <button
            onClick={() => setShowVocabModal(true)}
            className="px-3 py-1 bg-amber-800 text-white rounded hover:bg-amber-700 text-sm flex items-center transition-colors"
          >
            <span className="mr-1">
              <Brain />
            </span>{" "}
            Vocabulary
          </button>
          <button
            onClick={() => setShowQuotesModal(true)}
            className="px-3 py-1 bg-amber-800 text-white rounded hover:bg-amber-700 text-sm flex items-center transition-colors"
          >
            <span className="mr-1">
              <MessageCircleMore />
            </span>{" "}
            Quotes
          </button>
          <button
            onClick={() => setShowBookmarksModal(true)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-500 text-sm flex items-center transition-colors"
          >
            <span className="mr-1">
              <BookMarked />
            </span>{" "}
            Bookmarks
          </button>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-500 text-sm flex items-center transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="inline-block w-4 h-4 mr-1" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="inline-block w-4 h-4 mr-1" /> Dark Mode
              </>
            )}
          </button>
          <button
            onClick={() => setShowTimerModal(true)}
            className={`px-3 py-1 ${
              isTimerActive ? "bg-red-600" : "bg-green-700"
            } text-white rounded hover:bg-green-500 text-sm flex items-center transition-colors`}
          >
            <span className="mr-1">
              <Timer />
            </span>{" "}
            {isTimerActive ? formatTime(timeRemaining) : "Set Timer"}
          </button>
        </div>
      </div>
      <div
        className={`relative h-full w-full ${isDarkMode ? "dark-mode" : ""}`}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={url}
            plugins={[
              defaultLayoutPluginInstance,
              pageNavigationPluginInstance,
            ]}
            initialPage={currentPage}
            onPageChange={(e) => {
              const newPage = e.currentPage - 1;
              setCurrentPage(newPage);
              saveLastPosition(newPage);
            }}
          />
        </Worker>
      </div>
      {/* Dictionary Modal */}
      {showDictionaryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-amber-100 rounded-xl shadow-lg p-6 max-w-md w-full transform transition-all">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                📘 Dictionary
              </h2>
              <button
                onClick={() => setShowDictionaryModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-xl font-semibold mb-1 text-amber-800">
                {selectedWord}
              </p>
              {audioUrl && (
                <button
                  onClick={() => new Audio(audioUrl).play()}
                  className="flex items-center text-amber-600 hover:text-amber-800 text-sm mb-2"
                >
                  <span className="mr-1">🔊</span> Hear Pronunciation
                </button>
              )}
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="text-amber-800">{meaning}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDictionaryModal(false)}
                className="px-4 py-2 rounded text-amber-800 bg-amber-200 hover:bg-amber-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={saveVocabulary}
                className="px-4 py-2 rounded bg-amber-500 text-amber-800 hover:bg-amber-600 transition-colors"
              >
                Save to Vocabulary
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="bg-amber-100 rounded-xl shadow-lg p-6 max-w-lg w-full transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                💬 Save Quote
              </h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-1">Selected Text:</h3>
              <div className="bg-gray-50 p-3 rounded-md border-l-4 text-gray-800 whitespace-pre-wrap">
                {selectedQuote}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-amber-700 mb-1">
                Add a note (optional):
              </label>
              <textarea
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                className="w-full p-3 border text-amber-800 border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                rows={3}
                placeholder="Why is this quote important?"
              />
            </div>
            <div className="flex items-center mb-4"></div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 rounded text-amber-800 bg-amber-200 hover:bg-amber-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveQuote}
                className="px-4 py-2 rounded bg-yellow-500 text-amber-800 hover:bg-yellow-600 transition-colors"
              >
                Save Quote
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Vocabulary List Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-amber-100 max-h-[80vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-xl transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                📝 Vocabulary List
              </h2>
              <button
                onClick={() => setShowVocabModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            {vocabList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No vocabulary saved yet.</p>
                <p className="mt-2">
                  Select a word in Vocab Mode to add it to your list.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {vocabList.map((entry) => (
                  <li key={entry._id} className="py-3">
                    <p className="text-lg font-semibold text-amber-800">
                      {entry.word}
                    </p>
                    <p className="text-gray-700">{entry.meaning}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Quotes List Modal */}
      {showQuotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-amber-100 max-h-[80vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-2xl transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                💬 Saved Quotes
              </h2>
              <button
                onClick={() => setShowQuotesModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            {quotesList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No quotes saved yet.</p>
                <p className="mt-2">
                  Select text in Quote Mode to save important passages.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotesList.map((quote) => (
                  <div
                    key={quote._id}
                    className="border-l-4 pl-4 py-3 hover:bg-amber-50 cursor-pointer rounded-md transition-colors"
                    style={{ borderColor: quote.color || "#FFEB3B" }}
                    onClick={() => {
                      jumpToQuote(quote);
                      setShowQuotesModal(false);
                    }}
                  >
                    <p className="text-gray-800 mb-2 text-lg">&quot;{quote.text}&quot;</p>
                    {quote.note && (
                      <div className="bg-gray-100 p-3 rounded">
                        <p className="text-amber-700 italic">
                          Note: {quote.note}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-500 text-sm">
                        Page {quote.pageIndex + 1} •{" "}
                        {new Date(quote.createdAt).toLocaleString()}
                      </p>
                      <button
                        className="text-amber-600 hover:text-amber-800 text-sm flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToQuote(quote);
                          setShowQuotesModal(false);
                        }}
                      >
                        Jump to quote →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-amber-100 rounded-xl shadow-lg p-6 max-w-md w-full transform transition-all">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                🔖 Add Bookmark
              </h2>
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            <div className="mb-4 bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="text-amber-800">
                <strong>Current Page:</strong> {currentPage + 1}
              </p>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-amber-700 mb-1">
                Bookmark Label:
              </label>
              <input
                type="text"
                value={bookmarkLabel}
                onChange={(e) => setBookmarkLabel(e.target.value)}
                className="w-full p-3 border text-amber-800 border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="e.g., Important section"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBookmark}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bookmarks List Modal */}
      {showBookmarksModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-amber-100 max-h-[80vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-xl transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                📑 Bookmarks
              </h2>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No bookmarks saved yet.</p>
                <p className="mt-2">
                  Add bookmarks to quickly navigate to important pages.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {bookmarks.map((bookmark) => (
                  <li
                    key={bookmark._id}
                    className="py-3 flex justify-between items-center cursor-pointer hover:bg-amber-50 px-3 rounded-md transition-colors"
                    onClick={() => {
                      jumpToPage(bookmark.pageIndex);
                      setShowBookmarksModal(false);
                    }}
                  >
                    <div>
                      <p className="text-lg font-medium text-amber-800">
                        {bookmark.label}
                      </p>
                      <p className="text-sm text-amber-500">
                        Page {bookmark.pageIndex + 1}
                      </p>
                    </div>
                    <button className="text-amber-600 hover:text-amber-800 flex items-center">
                      Go to page →
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {showTimerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-amber-100 rounded-xl shadow-lg p-6 max-w-md w-full transform transition-all">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-xl text-amber-800 font-semibold">
                ⏱️ Reading Timer
              </h2>
              <button
                onClick={() => {
                  setShowTimerModal(false);
                  stopAlarm();
                }}
                className="text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                <X />
              </button>
            </div>

            <div className="mb-6 text-center">
              <div className="text-4xl font-bold mb-4 text-amber-800">
                {formatTime(timeRemaining)}
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {!isTimerActive ? (
                  <button
                    onClick={startTimer}
                    className="flex items-center justify-center p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Play size={24} />
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center justify-center p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                  >
                    <Pause size={24} />
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="flex items-center justify-center p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium text-amber-700 mb-2">
                Set Timer Duration (max 2 hours):
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90, 120].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => updateTimerDuration(minutes)}
                    className={`py-2 rounded ${
                      timerDuration === minutes
                        ? "bg-amber-600 text-white"
                        : "bg-amber-200 text-amber-800 hover:bg-amber-300"
                    }`}
                  >
                    {minutes === 60
                      ? "1 hour"
                      : minutes === 120
                      ? "2 hours"
                      : `${minutes} min`}
                  </button>
                ))}

                <div className="col-span-3 mt-2">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={timerDuration}
                    onChange={(e) =>
                      updateTimerDuration(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-amber-700 mt-1">
                    <span>5m</span>
                    <span>1h</span>
                    <span>2h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600 bg-amber-50 p-3 rounded-md">
              <p>
                The timer will continue running in the background while you
                read. An alarm will sound when your reading time is up.
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowTimerModal(false);
                  stopAlarm();
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isTimerActive && !showTimerModal && (
        <div className="fixed bottom-4 right-4 bg-amber-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center">
          <Clock className="mr-2" size={16} />
          <span className="font-mono">{formatTime(timeRemaining)}</span>
          <button
            onClick={pauseTimer}
            className="ml-2 p-1 hover:bg-amber-700 rounded-full"
          >
            <Pause size={14} />
          </button>
        </div>
      )}
      {timeRemaining === 0 && !showTimerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-amber-100 rounded-xl shadow-lg p-6 max-w-md w-full transform transition-all">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-800 mb-4">
                Time&apos;s Up!
              </h2>
              <p className="mb-6 text-gray-700">
                You&apos;ve reached your 2-hour reading limit. Take a break to rest
                your eyes!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    resetTimer();
                    stopAlarm();
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                >
                  Reset Timer
                </button>
                <button
                  onClick={stopAlarm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Stop Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ViewPdf;
