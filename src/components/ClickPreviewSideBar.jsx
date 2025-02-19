import React, { useState } from "react";

const PreviewSideBar = () => {
  const [modelSize, setModelSize] = useState(0.8);
  const [duration, setDuration] = useState(20);
  const [flag, setFlag] = useState(false);
  const [unit, setUnit] = useState("Km");

  return (
    <div className="p-4 text-white">
      <div className="max-w-md mx-auto flex flex-col justify-between  ">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex text-xs justify-between">
              <span>Model size</span>
            <span>{modelSize.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={modelSize}
            onChange={(e) => setModelSize(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* Duration Slider */}
        <div className="space-y-2">
          <div className="flex text-xs justify-between">
            <span>Duration</span>
            <span>{duration} Sec</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* Flag Toggle */}
        <div className="flex justify-between items-center">
          <span className="text-xs">Flag</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={flag}
              onChange={() => setFlag(!flag)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
        </div>

        {/* Unit Selector */}
        <div className="space-y-2 text-xs">
          <span>Unit</span>
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            {["Km", "M", "Off"].map((option) => (
              <button
                key={option}
                onClick={() => setUnit(option)}
                className={`flex-1 cursor-pointer py-1 px-3 rounded-md text-xs transition-colors ${
                  unit === option
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Map Style */}
        <button className="flex justify-between text-xs items-center w-full py-2">
          <span>Map style</span>
          <svg
            className="w-5 h-5 cursor-pointer"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        </div>

        {/* Add Destinations Button */}
        <button className="w-full cursor-pointer bg-gray-800 hover:bg-gray-700 text-blue-500 py-3 rounded-lg flex items-center justify-center gap-2 mt-4">
          <span className="text-2xl">+</span>
          Add destinations
        </button>
      </div>
    </div>
  );
};

export default PreviewSideBar;
