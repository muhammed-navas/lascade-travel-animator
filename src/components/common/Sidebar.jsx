import { FaCircle, FaMapMarkerAlt } from "react-icons/fa";
import startLocationIcons from "../../assets/input-icons1.png";
import { useWaypoints } from "../../context/WaypointsContext";
import { useEffect, useCallback, useRef, useState } from "react";
import ClickRouteSideBar from "../ClickRouteSideBar";
import PreviewSideBar from "../ClickPreviewSideBar";

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
    isColor,
    setIsColor,
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

  const ClickButtonHandle = (item) => {
    setIsColor(item);
  };


  return (
    <div className="w-72 bg-[#000000]   ">
      <div className="rounded-2xl bg-[#121216] h-full border-gray-800 flex flex-col p-3">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex border border-gray-800 rounded-full p-1">
          {["Routes", "Preview"].map((item, i) => (
            <button
              key={i}
              onClick={() => ClickButtonHandle(item)}
              className={`flex-1 px-4 text-white duration-500 cursor-pointer py-2 rounded-full  ${
                isColor === item ? "bg-[#0A84FF]" : "  "
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="border-gray-800 border mt-6" />
        {isColor === "Routes" ? (
          <ClickRouteSideBar
            handleInputChange={handleInputChange}
            handleSelectLocation={handleSelectLocation}
            startingSuggestions={startingSuggestions}
            startLocationIcons={startLocationIcons}
            waypoints={waypoints}
            isLoading={isLoading}
            startingPoint={startingPoint}
            endingPoint={endingPoint}
          />
        ) : (
          <PreviewSideBar />
        )}
      </div>
    </div>
  );
}
