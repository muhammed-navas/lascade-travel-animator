import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";
import not from "../../assets/not.png";
import MapPreview from "../map/MapPreview";
import ThreeJSCar from "../map/Three";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map() {
  const { waypoints, isColor, selectedStartLocation, selectedEndLocation } =
    useWaypoints();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const markersRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    // Ensure the map container is available in the DOM
    if (!mapContainer.current) return;

    try {
      // Initialize the map only if the container is available
      map.current = new mapboxgl.Map({
        container: mapContainer.current, // Ensure this is a valid HTML element
        style: "mapbox://styles/mapbox/streets-v12",
        center: [76.2673, 9.9312],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        attributionControl: true,
      });

      map.current.on("load", () => {
        setMapReady(true); // Set map as ready once loaded
      });

      map.current.on("error", (error) => {
        console.error("Mapbox error:", error);
        setMapError(error);
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError(error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isColor]); // Re-run effect if `isColor` changes

  return (
    <div className="w-full h-full relative">
      {isColor === "Preview" ? (
        <div className="absolute  inset-0 w-md h-[20rem] top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 rounded-2xl">
          <MapPreview />
          <ThreeJSCar />
        </div>
      ) : (
        <div className="w-full h-full  bg-[#121216] rounded-2xl overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      )}

      {/* Show warning if waypoints are insufficient */}
      {waypoints?.length < 2 && (
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl">
          <img src={not} alt="not" className="w-4 h-4" />
          <span className="text-sm">
            Oops! Preview mode needs at least 2 Way points to work.
          </span>
        </div>
      )}
    </div>
  );
}
