import { createContext, useContext, useState } from "react";

const WaypointsContext = createContext();

export function WaypointsProvider({ children }) {
  const [waypoints, setWaypoints] = useState(2);
  const [startingPoint, setStartingPoint] = useState(
    "Edappally, Ernakulam, Ernakulam, Kerala, India"
  );
  const [endingPoint, setEndingPoint] = useState("aluva");
  const [startingSuggestions, setStartingSuggestions] = useState([]);
  const [endingSuggestions, setEndingSuggestions] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isColor, setIsColor] = useState("Routes");

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

  // Function to update waypoints
  const updateWaypoints = () => {
    try {
      const points = [];
      if (selectedStartLocation) {
        points.push({
          name: selectedStartLocation.place_name,
          longitude: selectedStartLocation.center[0],
          latitude: selectedStartLocation.center[1],
          type: "start",
        });
      }
      if (selectedEndLocation) {
        points.push({
          name: selectedEndLocation.place_name,
          longitude: selectedEndLocation.center[0],
          latitude: selectedEndLocation.center[1],
          type: "end",
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
