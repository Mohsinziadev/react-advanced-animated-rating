import React, { useEffect, useState } from "react";
import Rating from "./components/Rating";
import './App.css';

function App() {
  const [currentRating, setCurrentRating] = useState(3);
  const [readonylyRating, setReadOnlyRating] = useState(4);

  const handleRatingChange = (newRating) => {
    setCurrentRating(newRating);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
     
      <div className="flex flex-col items-start">
      <div className="flex justify-start">
        <h2 className="text-lg font-semibold text-gray-800">
          React Advanced Animated Rating
        </h2>
      </div>
        <div className="my-8">
          <h2 className="text-md font-light text-gray-800">Editable Rating</h2>
          <div className="flex gap-4 items-center ">
            <Rating
              rating={currentRating}
              editable={true}
              onChange={handleRatingChange}
            />
            <p className="text-lg font-light text-gray-700">
              {currentRating} / 5
            </p>
          </div>
        </div>
        <div className="my-0">
          <h2 className="text-md font-light text-gray-800">Read-Only Rating</h2>
          <div className="flex gap-4 items-center ">
            <Rating rating={readonylyRating} editable={false} />
            <p className="text-lg font-light text-gray-700">
              {readonylyRating} / 5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
