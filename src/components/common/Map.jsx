import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";
import not from "../../assets/not.png";
import MapPreview from "../map/MapPreview";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map() {
  const { waypoints, isColor } = useWaypoints();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [76.2673, 9.9312],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        attributionControl: true,
      });

      map.current.on("load", () => {
        map.current.resize();
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
        setMapReady(true);
      });

      map.current.on("error", (error) => {
        console.error("Mapbox error:", error);
        setMapError(error);
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError(error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isColor]);

  // Handle waypoints updates
  useEffect(() => {
    if (!map.current || !mapReady || !waypoints) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();

    // waypoints.forEach((waypoint) => {
    //   const marker = new mapboxgl.Marker()
    //     .setLngLat([waypoint.longitude, waypoint.latitude])
    //     .addTo(map.current);

    //   if (waypoint.name) {
    //     new mapboxgl.Popup({ offset: 25 })
    //       .setLngLat([waypoint.longitude, waypoint.latitude])
    //       .setHTML(`<h3>${waypoint.name}</h3>`)
    //       .addTo(map.current);
    //   }

    //   markersRef.current.push(marker);
    //   bounds.extend([waypoint.longitude, waypoint.latitude]);
    // });

    // Fit bounds if there are waypoints
    // if (waypoints.length > 0) {
    //   map.current.fitBounds(bounds, {
    //     padding: 50,
    //     maxZoom: 15,
    //   });
    // }
  }, [waypoints, mapReady]);

  // Handle resize
  useEffect(() => {
    if (!map.current) return;

    const resizeHandler = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    setTimeout(resizeHandler, 100);
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [mapReady, isColor]);

  if (mapError) {
    return (
      <div className="text-red-500 p-4">
        Error loading map: {mapError.message}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isColor === "Routes" ? (
        <div className="absolute inset-0 bg-[#121216] rounded-2xl overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#121216] rounded-2xl flex items-center justify-center">
          <MapPreview
            mapContainer={mapContainer}
            map={map}
            setMapReady={setMapReady}
            setMapError={setMapError}
          />
        </div>
      )}

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
