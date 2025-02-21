import { createContext, useContext, useState } from "react";

const WaypointsContext = createContext();

export function WaypointsProvider({ children }) {
  const [waypoints, setWaypoints] = useState(3);
  const [startingPoint, setStartingPoint] = useState("Thrissur, Kerala, India");
  const [endingPoint, setEndingPoint] = useState("kollam");
  const [startingSuggestions, setStartingSuggestions] = useState([]);
  const [endingSuggestions, setEndingSuggestions] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isColor, setIsColor] = useState("Routes");

   const [waypointInputs, setWaypointInputs] = useState([]);

  // Function to handle errors
  const handleError = (error, message = "Something went wrong") => {
    console.error(error);
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Function to clear suggestions
  const clearSuggestions = (isStart = true) => {
    if (isStart) {
      setStartingSuggestions([]);
    } else {
      setEndingSuggestions([]);
    }
  };

  // Updated updateWaypoints function
  const updateWaypoints = () => {
    try {
      const points = [];
      if (selectedStartLocation) {
        points.push({
          name: startingPoint,
          type: "start",
          latitude: selectedStartLocation.center[1],
          longitude: selectedStartLocation.center[0],
        });
      }
      if (selectedEndLocation) {
        points.push({
          name: endingPoint,
          type: "end",
          latitude: selectedEndLocation.center[1],
          longitude: selectedEndLocation.center[0],
        });
      }
      setWaypoints(points);
    } catch (error) {
      handleError(error, "Failed to update waypoints");
    }
  };

  const value = {
    waypoints,
    setWaypoints,
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
    setError,
    handleError,
    clearSuggestions,
    updateWaypoints,
    isColor,
    setIsColor,
    waypointInputs,
    setWaypointInputs,
  };

  return (
    <WaypointsContext.Provider value={value}>
      {children}
    </WaypointsContext.Provider>
  );
}

export function useWaypoints() {
  const context = useContext(WaypointsContext);
  if (!context) {
    throw new Error("useWaypoints must be used within a WaypointsProvider");
  }
  return context;
}
