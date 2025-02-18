import { FaCircle, FaMapMarkerAlt } from "react-icons/fa";
import startLocationIcons from "../../assets/input-icons1.png";
import endLocationIcons from "../../assets/input-icons.png";
import { useWaypoints } from "../../context/WaypointsContext";
import { useEffect, useCallback, useRef } from "react";

export default function Sidebar() {
  const {
    startingPoint,
    setStartingPoint,
    endingPoint,
    setEndingPoint,
    startingSuggestions,
    setStartingSuggestions,
    endingSuggestions,
    setEndingSuggestions,
    selectedStartLocation,
    setSelectedStartLocation,
    selectedEndLocation,
    setSelectedEndLocation,
    isLoading,
    setIsLoading,
    error,
    handleError,
    clearSuggestions,
    updateWaypoints,
    waypoints,
  } = useWaypoints();

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query, isStart) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(query, isStart);
    }, 300);
  }, []);

  const searchPlaces = async (query, isStart = true) => {
    if (!query) {
      clearSuggestions(isStart);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${
          import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
        }&limit=5`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.features) {
        throw new Error("No results found");
      }

      if (isStart) {
        setStartingSuggestions(data.features);
      } else {
        setEndingSuggestions(data.features);
      }
    } catch (error) {
      handleError(error, "Failed to fetch location suggestions");
      clearSuggestions(isStart);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, isStart) => {
    const value = e.target.value;
    if (isStart) {
      setStartingPoint(value);
      if (selectedStartLocation) {
        setSelectedStartLocation(null);
      }
    } else {
      setEndingPoint(value);
      if (selectedEndLocation) {
        setSelectedEndLocation(null);
      }
    }
    debouncedSearch(value, isStart);
  };

  const handleSelectLocation = (location, isStart) => {
    try {
      if (isStart) {
        setStartingPoint(location.place_name);
        setSelectedStartLocation(location);
        setStartingSuggestions([]);
      } else {
        setEndingPoint(location.place_name);
        setSelectedEndLocation(location);
        setEndingSuggestions([]);
      }
      updateWaypoints();
    } catch (error) {
      handleError(error, "Failed to select location");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="w-72 bg-[#000000]   h-[90vh]">
      <div className="rounded-2xl bg-[#121216] h-full border-gray-800 flex flex-col p-3">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex border border-gray-800 rounded-full p-1">
          <button className="flex-1 px-4 text-white cursor-pointer py-2 bg-[#0A84FF] rounded-full border-b-2 border-blue-500">
            Routes
          </button>
          <button className="flex-1 px-4 cursor-pointer py-2 text-gray-400 rounded-full hover:bg-gray-800">
            Preview
          </button>
        </div>
        <div className="border-gray-800 border mt-6" />

        <div className="p-4">
          <div className="text-sm text-gray-400 mb-4">
            {waypoints || 0} Way points
          </div>

          <div className="space-y-3">
            <div className="relative">
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

            <div className="relative">
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
              {endingSuggestions.length > 0 && (
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
      </div>
    </div>
  );
}
