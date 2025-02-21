import React from "react";
import endLocationIcons from "../assets/input-icons.png";

const ClickRouteSideBar = ({
  handleInputChange,
  startingSuggestions,
  startLocationIcons,
  waypoints,
  isLoading,
  startingPoint,
  endingPoint,
  handleSelectLocation,
  endingSuggestions,
}) => {
  return (
    <div className="py-4 px-2">
      <div className="text-sm text-gray-400 mb-4">
        {waypoints || 0} Way points
      </div>

      <div className="space-y-3">
        <div className="relative flex items-center gap-2">
          {" "}
          <span className="text-white">==</span>
          <div className="flex items-center space-x-2 p-3 rounded-full bg-[#202024]">
            <img src={startLocationIcons} alt="" />
            <input
              type="text"
              placeholder="Starting point"
              name="startingPoint"
              id="startingPoint"
              onChange={(e) => handleInputChange(e, true)}
              value={startingPoint}
              className="bg-transparent w-full text-gray-400 text-sm outline-none"
              disabled={isLoading}
            />
            {isLoading && startingPoint && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
            )}
          </div>
          {startingSuggestions.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#202024] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {startingSuggestions.map((place) => (
                <div
                  key={place.id}
                  className="px-4 py-2 hover:bg-[#2C2C30] cursor-pointer text-gray-400 text-xs"
                  onClick={() => handleSelectLocation(place, true)}
                >
                  {place.place_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          {" "}
          <span className="text-white">==</span>
          <div className="flex items-center space-x-2 p-3 rounded-full bg-[#202024]">
            <img src={endLocationIcons} alt="" />
            <input
              type="text"
              placeholder="Ending point"
              name="endingPoint"
              id="endingPoint"
              onChange={(e) => handleInputChange(e, false)}
              value={endingPoint}
              className="bg-transparent w-full text-gray-400 text-sm outline-none"
              disabled={isLoading}
            />
            {isLoading && endingPoint && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
            )}
          </div>
          {endingSuggestions?.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#202024] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {endingSuggestions.map((place) => (
                <div
                  key={place.id}
                  className="px-4 py-2 hover:bg-[#2C2C30] cursor-pointer text-gray-400 text-xs"
                  onClick={() => handleSelectLocation(place, false)}
                >
                  {place.place_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClickRouteSideBar;
