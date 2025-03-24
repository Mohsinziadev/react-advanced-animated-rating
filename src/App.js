import React, { useEffect, useState } from "react";
import Rating from "./components/Rating";
import "./App.css";

function App() {
  const [currentRating, setCurrentRating] = useState(3);
  const [readonylyRating, setReadOnlyRating] = useState(4);

  const handleRatingChange = (newRating) => {
    setCurrentRating(newRating);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#dadada] items-center bg-gray-100">
      <div className="flex flex-col gap-4 items-start">
        <div className="flex justify-start">
          <h2 className="text-md font-normal uppercase text-gray-800">
            React Advanced Animated Rating
          </h2>
        </div>
        <div className="shadow-md p-8 rounded-md bg-white ">
          <div className="">
            <div className="flex flex-col gap-0 text-center  ">
              <h2 className="text-md font-light text-gray-800">
                Editable Rating
              </h2>
              <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                Please Take a moment to rate and review{" "}
              </p>
            </div>
            <div className="flex mt-6 gap-4 items-center ">
              <Rating
                rating={currentRating}
                editable={true}
                startColor="text-yellow-500"
                backgroundClass="bg-[#f8f8f8] rounded-md p-0"
                onChange={handleRatingChange}
              />
              <p className="text-sm font-light text-gray-700">
                {currentRating} / 5
              </p>
            </div>
          </div>
        </div>

        <div className="shadow-md p-8 rounded-md bg-white ">
          <div className="">
            <div className="flex flex-col gap-0 text-center  ">
              <h2 className="text-md font-light text-gray-800">
                Read-Only Rating
              </h2>
              <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                Read-Only Rating: View and Review{" "}
              </p>
            </div>
            <div className="flex mt-6 gap-4 items-center ">
              <Rating
                rating={readonylyRating}
                startColor="#008000"
                backgroundClass="bg-[#f8f8f8] rounded-md p-0"
                editable={false}
              />
              <p className="text-sm font-light text-gray-700">
                {readonylyRating} / 5
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
