import React, { useState } from "react";
import Rating from "./components/Rating";
import "./App.css";

function App() {
  const [currentRating, setCurrentRating] = useState(3);
  const [readonylyRating, setReadOnlyRating] = useState(4);
  const [ratingAlert, setRatingAlert] = useState(3);
  const [resetRating, setResetRating] = useState(2);

  const handleRatingChange = (newRating) => {
    setCurrentRating(newRating);
  };

  const handleRatingChangeAlert = (newRating) => {
    alert("Rating: " + newRating);
    setRatingAlert(newRating);
  };

  const handleResetRatingChange = (newRating) => {
    setResetRating(newRating);
  };
  const resetRatingValue = () => {
    setResetRating(2);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-[#dadada] items-start p-10 bg-gray-100">
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex justify-center w-full shadow-md rounded-md p-4 bg-white ">
          <h2 className="text-md font-normal uppercase text-gray-800">
            React Advanced Animated Rating
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="grid grid-rows-4 gap-4">
            <div className="shadow-md p-8 rounded-md bg-white ">
              <div className="">
                <div className="flex flex-col gap-0 text-center">
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
                    enableAnimation={true}
                    starColor="#FFDF00"
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
                <div className="flex flex-col gap-0 text-center">
                  <h2 className="text-md font-light text-gray-800">
                    Editable Rating with No Background
                  </h2>
                  <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                    Please Take a moment to rate and review{" "}
                  </p>
                </div>
                <div className="flex mt-6 gap-4 items-center ">
                  <Rating
                    rating={currentRating}
                    editable={true}
                    starColor="#FFDF00"
                    enableAnimation={true}
                    backgroundClass="bg-none rounded-md p-0"
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
                <div className="flex flex-col gap-0 text-center">
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
                    enableAnimation={true}
                    starColor="black"
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

          <div className="grid grid-rows-4 gap-4">
            <div className="shadow-md p-8 rounded-md bg-white ">
              <div className="">
                <div className="flex flex-col gap-0 text-center">
                  <h2 className="text-md font-light text-gray-800">
                    Read-Only Rating with no Animation
                  </h2>
                  <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                    Read-Only Rating: View and Review{" "}
                  </p>
                </div>
                <div className="flex mt-6 gap-4 items-center ">
                  <Rating
                    rating={readonylyRating}
                    enableAnimation={false}
                    starColor="black"
                    backgroundClass="bg-none rounded-md p-0"
                    editable={false}
                  />
                  <p className="text-sm font-light text-gray-700">
                    {readonylyRating} / 5
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-md p-8 rounded-md bg-white ">
              <div className="">
                <div className="flex flex-col gap-0 text-center">
                  <h2 className="text-md font-light text-gray-800">
                    Alert on Rating
                  </h2>
                  <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                    Please Take a moment to rate and review.
                  </p>
                </div>
                <div className="flex mt-6 gap-4 items-center ">
                  <Rating
                    rating={ratingAlert}
                    editable={true}
                    enableAnimation={true}
                    starColor="#EC8A1C"
                    backgroundClass="bg-[#f8f8f8] rounded-md p-0"
                    onChange={handleRatingChangeAlert}
                  />
                  <p className="text-sm font-light text-gray-700">
                    {ratingAlert} / 5
                  </p>
                </div>
              </div>
            </div>
            <div className="shadow-md p-8 rounded-md bg-white ">
              <div className="">
                <div className="flex flex-col gap-0 text-center">
                  <h2 className="text-md font-light text-gray-800">
                    Reset Rating
                  </h2>
                  <p className="text-sm text-[#adadad] m-0 p-0 font-light">
                    Please take a moment to reset your rating.
                  </p>
                </div>
                <div className="flex mt-6 gap-4 items-center ">
                  <Rating
                    rating={resetRating}
                    editable={true}
                    enableAnimation={true}
                    starColor="#FF6035"
                    backgroundClass="bg-[#f8f8f8] rounded-md p-0"
                    onChange={handleResetRatingChange}
                  />
                  <p
                    onClick={resetRatingValue}
                    className="text-sm bg-[#f3f3f3] text-black cursor-pointer  rounded-md p-2 font-light text-gray-700"
                  >
                    Reset
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
