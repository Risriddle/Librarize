import { useState, useEffect } from "react";
import { Star,  Edit, Check, X } from "lucide-react";

interface BookReviewProps {
  bookId: string;
  onClose: () => void;
}

export default function BookReview({ bookId, onClose }: BookReviewProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasExistingReview, setHasExistingReview] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Check if there's an existing review
  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ratings?pdfId=${bookId}`);
        if (res.ok) {
          const data = await res.json();
          if(data.success){
            setRating(data.data.rating);
            setReview(data.data.review);
            setHasExistingReview(true);
            setIsEditing(false);
          } else {
            setHasExistingReview(false);
            setIsEditing(true);
          }
        } else {
          setHasExistingReview(false);
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error fetching review:", err);
        setHasExistingReview(false);
        setIsEditing(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReview();
  }, [bookId]);
  
  const handleSubmit = async() => {
    setSubmitting(true);
    
    const payload = {
      
      rating,
      review: review,
    };
    
    try {
      const res = await fetch(`/api/ratings?pdfId=${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("Failed to save review");
      
      setSubmitting(false);
      setHasExistingReview(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving review:", err);
      setSubmitting(false);
    }
  };

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

  // Handle click on star or half star
  const handleStarClick = (position: number, isHalf: boolean) => {
    const newRating = isHalf ? position - 0.5 : position;
    
    // If clicking on the same rating, toggle it off
    if (rating === newRating) {
      setRating(0);
    } else {
      setRating(newRating);
    }
  };
  
  // Render the star rating component
  const renderStars = (interactive = false) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((starPosition) => {
        const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;
        const starType = getStarType(starPosition, currentRating);
        
        return (
          <div 
            key={starPosition}
            className={`relative ${interactive ? "cursor-pointer" : ""}`}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          >
            {/* Star container with both halves */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Base star (empty or full) */}
              <Star
                size={32}
                className={`absolute ${
                  starType === "full"
                    ? "fill-amber-400 text-amber-400"
                    : interactive ? "text-amber-600" : "text-amber-500"
                } transition-colors`}
              />
              
              {/* Half star overlay */}
              {starType === "half" && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star 
                    size={32}
                    className="fill-amber-400 text-amber-400"
                  />
                </div>
              )}
              
              {/* Interactive areas */}
              {interactive && (
                <>
                  {/* Left half - for half star */}
                  <div 
                    className="absolute inset-y-0 left-0 w-1/2 z-10 group"
                    onMouseEnter={() => setHoverRating(starPosition - 0.5)}
                    onClick={() => handleStarClick(starPosition, true)}
                  >
                   
                  </div>
                  
                  {/* Right half - for full star */}
                  <div 
                    className="absolute inset-y-0 right-0 w-1/2 z-10"
                    onMouseEnter={() => setHoverRating(starPosition)}
                    onClick={() => handleStarClick(starPosition, false)}
                  >
                    
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const getRatingText = (rating: number) => {
    if (rating === 5) return "Excellent!";
    if (rating >= 4.5) return "Outstanding!";
    if (rating >= 4) return "Very good!";
    if (rating >= 3.5) return "Pretty good!";
    if (rating >= 3) return "Good";
    if (rating >= 2.5) return "Decent";
    if (rating >= 2) return "Fair";
    if (rating >= 1.5) return "Below average";
    if (rating >= 1) return "Poor";
    if (rating >= 0.5) return "Very poor";
    return "";
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="h-6 bg-amber-700/50 rounded w-32 mb-4"></div>
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 bg-amber-800/50 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-amber-800/50 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-amber-950 to-amber-900 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-amber-100">
          {hasExistingReview && !isEditing ? "Your Review" : "Review Book"}
        </h2>
        <button 
          onClick={onClose}
          className="text-amber-400 hover:text-amber-300 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      {hasExistingReview && !isEditing ? (
        // Display existing review
        <div className="space-y-6">
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-800/50">
            <p className="text-amber-300 text-sm font-medium mb-2">Your Rating</p>
            <div className="flex items-center gap-3">
              {renderStars(false)}
              <p className="text-amber-300 font-medium">
                {getRatingText(rating)} ({rating})
              </p>
            </div>
          </div>
          
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-800/50">
            <p className="text-amber-300 text-sm font-medium mb-2">Your Review</p>
            <div className="text-amber-100 min-h-24 whitespace-pre-wrap">
              {review || <span className="text-amber-500 italic">No written review provided</span>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-800/70 text-amber-100 rounded-md hover:bg-amber-700 transition-colors text-sm"
            >
              Close
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-amber-600/80 hover:bg-amber-500 text-amber-100 rounded-md transition-colors flex items-center gap-2 text-sm"
            >
              <Edit size={16} /> Edit Review
            </button>
          </div>
        </div>
      ) : (
        // Edit or create review
        <div className="space-y-6">
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-800/50">
            <p className="text-amber-300 text-sm font-medium mb-3">Your Rating</p>
            <div className="flex flex-col gap-2">
              {renderStars(true)}
              <div className="h-6">
                {rating > 0 && (
                  <p className="text-amber-300 font-medium mt-2">
                    {getRatingText(rating)} ({rating})
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-800/50">
            <p className="text-amber-300 text-sm font-medium mb-3">Your Review</p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-4 py-3 bg-amber-950/70 border border-amber-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-amber-100 min-h-32 resize-y"
              placeholder="Write your thoughts about this book..."
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-2">
            <button
              onClick={() => hasExistingReview ? setIsEditing(false) : onClose()}
              className="px-4 py-2 bg-amber-800/70 text-amber-100 rounded-md hover:bg-amber-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className={`px-4 py-2 ${
                submitting || rating === 0
                  ? "bg-amber-800/50 cursor-not-allowed"
                  : "bg-amber-600/80 hover:bg-amber-500"
              } text-amber-100 rounded-md transition-colors flex items-center gap-2 text-sm`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-amber-100 rounded-full border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{hasExistingReview ? "Update Review" : "Save Review"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}