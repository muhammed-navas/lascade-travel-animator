import React, { useState, useCallback, useEffect } from "react";
import endLocationIcons from "../assets/end.png";
import { FaGripLines } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { useWaypoints } from "../context/WaypointsContext";
import mapboxgl from "mapbox-gl";

const ClickRouteSideBar = ({
  startLocationIcons,
  waypoints,
  isLoading,
  handleSelectLocation,
}) => {
  const { setStartingPoint, locations, setLocations } = useWaypoints();

  // State for managing all locations including coordinates


  // State for suggestions
  const [suggestions, setSuggestions] = useState({
    start: [],
    waypoints: {},
    end: [],
  });

  // State to track which input is focused
  const [activeSuggestions, setActiveSuggestions] = useState({
    type: null,
    id: null,
  });

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch suggestions from Mapbox
  const fetchSuggestions = async (query, type, waypointId = null) => {
    if (!query) {
      updateSuggestions([], type, waypointId);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          mapboxgl.accessToken
        }&types=place,address&limit=5`
      );
      const data = await response.json();
      const suggestions = data.features.map((feature) => ({
        text: feature.place_name,
        coordinates: feature.center,
      }));

      updateSuggestions(suggestions, type, waypointId);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      updateSuggestions([], type, waypointId);
    }
  };

  // Update suggestions state
  const updateSuggestions = (newSuggestions, type, waypointId = null) => {
    setSuggestions((prev) => {
      if (type === "waypoint") {
        return {
          ...prev,
          waypoints: {
            ...prev.waypoints,
            [waypointId]: newSuggestions,
          },
        };
      }
      return {
        ...prev,
        [type]: newSuggestions,
      };
    });
  };

  // Create debounced search functions
  const debouncedSearch = useCallback(
    debounce((query, type, waypointId) => {
      fetchSuggestions(query, type, waypointId);
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e, type, waypointId = null) => {
      const value = e.target.value;

      setLocations((prev) => {
        if (type === "waypoint" && waypointId) {
          return {
            ...prev,
            waypoints: prev.waypoints.map((wp) =>
              wp.id === waypointId ? { ...wp, address: value } : wp
            ),
          };
        }
        return {
          ...prev,
          [type]: { ...prev[type], address: value },
        };
      });

      debouncedSearch(value, type, waypointId);
    },
    [debouncedSearch]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion, type, waypointId = null) => {
    setLocations((prev) => {
      if (type === "waypoint") {
        return {
          ...prev,
          waypoints: prev.waypoints.map((wp) =>
            wp.id === waypointId
              ? {
                  ...wp,
                  address: suggestion.text,
                  coordinates: suggestion.coordinates,
                }
              : wp
          ),
        };
      }
      return {
        ...prev,
        [type]: {
          address: suggestion.text,
          coordinates: suggestion.coordinates,
        },
      };
    });

    updateSuggestions([], type, waypointId);
    setActiveSuggestions({ type: null, id: null });
  };

  // Add waypoint
  const addWaypoint = useCallback(() => {
    const newId = Date.now();
    setLocations((prev) => ({
      ...prev,
      waypoints: [
        ...prev.waypoints,
        { id: newId, address: "", coordinates: null },
      ],
    }));
    setSuggestions((prev) => ({
      ...prev,
      waypoints: { ...prev.waypoints, [newId]: [] },
    }));
  }, []);

  // Remove waypoint
  const removeWaypoint = useCallback((id) => {
    setLocations((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((wp) => wp.id !== id),
    }));
    setSuggestions((prev) => {
      const { [id]: removed, ...rest } = prev.waypoints;
      return {
        ...prev,
        waypoints: rest,
      };
    });
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".location-input")) {
        setSuggestions({
          start: [],
          waypoints: {},
          end: [],
        });
        setActiveSuggestions({ type: null, id: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




  // Suggestions list component
  const SuggestionsList = ({
    suggestions,
    onSelect,
    type,
    waypointId = null,
  }) => {
    if (
      !suggestions?.length ||
      activeSuggestions.type !== type ||
      (type === "waypoint" && activeSuggestions.id !== waypointId)
    ) {
      return null;
    }



    return (
      <div className="absolute z-10 mt-1 w-full bg-[#2a2a2e] rounded-md shadow-lg">
        <ul className="py-1">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3a3e] cursor-pointer"
              onClick={() => onSelect(suggestion, type, waypointId)}
            >
              {suggestion.text}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="py-4 px-2">
      <div className="text-sm text-gray-400 mb-4">
        {locations.waypoints.length + 2} Way points
      </div>

      <div className="space-y-3">
        {/* Starting Point Input */}
        <div className="relative flex items-center gap-2">
          <span className="text-white cursor-pointer">
            <FaGripLines />
          </span>
          <div className="relative w-full location-input">
            <div className="flex items-center space-x-2 p-3 rounded-full bg-[#202024]">
              <img src={startLocationIcons} alt="" />
              <input
                type="text"
                placeholder="Starting point"
                value={locations.start.address}
                onChange={(e) => handleInputChange(e, "start")}
                onFocus={() =>
                  setActiveSuggestions({ type: "start", id: null })
                }
                className="bg-transparent w-full text-gray-400 text-sm outline-none"
                disabled={isLoading}
              />
            </div>
            <SuggestionsList
              suggestions={suggestions.start}
              onSelect={handleSuggestionSelect}
              type="start"
            />
          </div>
        </div>

        {/* Waypoint Inputs */}
        {locations.waypoints.map((waypoint) => (
          <div key={waypoint.id} className="relative flex items-center gap-2">
            <span className="text-white">
              <FaGripLines />
            </span>
            <div className="relative w-full location-input">
              <div className="flex items-center space-x-2 p-3 rounded-full bg-[#202024]">
                <img src={endLocationIcons} alt="" />
                <input
                  type="text"
                  placeholder="Waypoint"
                  value={waypoint.address}
                  onChange={(e) =>
                    handleInputChange(e, "waypoint", waypoint.id)
                  }
                  onFocus={() =>
                    setActiveSuggestions({ type: "waypoint", id: waypoint.id })
                  }
                  className="bg-transparent w-full text-gray-400 text-sm outline-none"
                />
              </div>
              <SuggestionsList
                suggestions={suggestions.waypoints[waypoint.id]}
                onSelect={handleSuggestionSelect}
                type="waypoint"
                waypointId={waypoint.id}
              />
            </div>
            <span
              onClick={() => removeWaypoint(waypoint.id)}
              className="text-white cursor-pointer"
            >
              <MdClose />
            </span>
          </div>
        ))}

        {/* Ending Point Input */}
        <div className="relative flex items-center gap-2">
          <span onClick={addWaypoint} className="text-white cursor-pointer">
            <FaGripLines />
          </span>
          <div className="relative w-full location-input">
            <div className="flex items-center space-x-2 p-3 rounded-full bg-[#202024]">
              <img src={endLocationIcons} alt="" />
              <input
                type="text"
                placeholder="Ending point"
                value={locations.end.address}
                onChange={(e) => handleInputChange(e, "end")}
                onFocus={() => setActiveSuggestions({ type: "end", id: null })}
                className="bg-transparent w-full text-gray-400 text-sm outline-none"
                disabled={isLoading}
              />
            </div>
            <SuggestionsList
              suggestions={suggestions.end}
              onSelect={handleSuggestionSelect}
              type="end"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClickRouteSideBar;
