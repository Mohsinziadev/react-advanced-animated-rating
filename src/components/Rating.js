import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Rating = ({ rating, editable, onChange, backgroundClass, starColor }) => {
  const [currentRating, setCurrentRating] = useState(rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (editable) {
      setHoveredRating(index);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  // Handle click to change rating (editable)
  const handleStarClick = (index) => {
    if (editable && onChange) {
      setCurrentRating(index);
      onChange(index);
    }
  };

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  return (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <motion.div
          key={starIndex}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleStarClick(starIndex)}
        >
          <div className={`${backgroundClass}`}>
            <svg
              className={`w-10 h-10 cursor-pointer transition-all duration-200 ease-in-out ${
                starIndex <= (hoveredRating || currentRating)
                  ? "fill-current" // Always apply fill-current for filled stars
                  : "text-gray-300 fill-none" // Empty stars
              }`}
              style={{
                color:
                  starIndex <= (hoveredRating || currentRating)
                    ? starColor
                    : undefined,
              }} // Apply color dynamically based on the condition
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                fill="currentColor"
                d="M12 17.25l-3.54 2.11a1 1 0 01-1.45-1.05l.68-3.88-2.82-2.76a1 1 0 01.56-1.71l3.9-.32 1.47-3.58a1 1 0 011.9 0l1.47 3.58 3.9.32a1 1 0 01.56 1.71l-2.82 2.76.68 3.88a1 1 0 01-1.45 1.05L12 17.25z"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Rating;
