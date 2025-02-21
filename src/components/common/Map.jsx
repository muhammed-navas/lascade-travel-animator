import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";
import flight from "../../assets/flight.png";
import MapPreview from "../map/MapPreview";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map() {
  const {
    waypoints,
    isColor,
    selectedStartLocation,
    endingPoint,
    startingPoint,
    selectedEndLocation,
    waypointInputs,
  } = useWaypoints();

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const markersRef = useRef([]);
  const animationRef = useRef(null);
    const [markerPositions, setMarkerPositions] = useState({
      start: null,
      end: null,
      waypoint: null,
    });

  // Location database with coordinates
  const locationDatabase = {
    thrissur: [76.2144, 10.5276],
    kollam: [76.6141, 8.8932],
    kochi: [76.2673, 9.9312],
    bangalore: [77.5946, 12.9716],
    bengaluru: [77.5946, 12.9716],
    mumbai: [72.8777, 19.076],
    delhi: [77.1025, 28.7041],
    chennai: [80.2707, 13.0827],
    hyderabad: [78.4867, 17.385],
    pune: [73.8567, 18.5204],
    ahmedabad: [72.5714, 23.0225],
    jaipur: [75.7873, 26.9124],
    surat: [72.8311, 21.1702],
    lucknow: [80.9462, 26.8467],
    kanpur: [80.3319, 26.4499],
    nagpur: [79.0882, 21.1458],
    indore: [75.8577, 22.7196],
    thane: [72.9781, 19.2183],
    bhopal: [77.4126, 23.2599],
    visakhapatnam: [83.2185, 17.6868],
    calicut: [75.7804, 11.2588],
    trivandrum: [76.9366, 8.5241],
    mangalore: [74.856, 12.9141],
    goa: [74.124, 15.2993],
  };

  // Helper function to normalize location strings
 const normalizeLocation = (location) => {
   return location.toLowerCase().replace(/[^a-z0-9]/g, "");
 };

  // Helper function to get coordinates from various input formats
  const getCoordinates = (location, defaultCoords) => {
    if (!location) return defaultCoords;

    // Handle string input
    if (typeof location === "string") {
      const normalizedInput = normalizeLocation(location);

      // Search through location database
      for (const [key, coords] of Object.entries(locationDatabase)) {
        if (normalizedInput.includes(key)) {
          return coords;
        }
      }

      return defaultCoords;
    }

    // Handle coordinate object
    if (location.coordinates) {
      return location.coordinates;
    }

    // Handle lat/lng object
    if (location.lat !== undefined && location.lng !== undefined) {
      return [location.lng, location.lat];
    }

    // Handle coordinate array
    if (Array.isArray(location) && location.length >= 2) {
      return [location[0], location[1]];
    }

    return defaultCoords;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [76.2673, 9.9312], // Default center
        zoom: 12,
        pitch: 45,
        bearing: 0,
        attributionControl: true,
      });

      map.current.on("load", () => {
        setMapReady(true);
        map.current.resize();
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
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isColor]);

   const createDraggableMarker = (
     coordinates,
     isStart = true,
     isWaypoint = false
   ) => {
     const el = document.createElement("div");
     el.className = isWaypoint
       ? "waypoint-marker"
       : isStart
       ? "starting-marker"
       : "ending-marker";
     el.style.backgroundImage = `url(${flight})`;
     el.style.width = isWaypoint ? "35px" : "30px";
     el.style.height = isWaypoint ? "35px" : "30px";
     el.style.backgroundSize = "100%";
     el.style.borderRadius = "50%";
     el.style.cursor = "move";

     const marker = new mapboxgl.Marker({
       element: el,
       draggable: true,
     })
       .setLngLat(coordinates)
       .addTo(map.current);

     // Add drag events
     marker.on("dragend", () => {
       const newPos = marker.getLngLat();
       const position = {
         lng: newPos.lng,
         lat: newPos.lat,
       };

       // Update positions state
       setMarkerPositions((prev) => ({
         ...prev,
         [isWaypoint ? "waypoint" : isStart ? "start" : "end"]: position,
       }));

       // Update context if needed
       if (isStart) {
         setStartingPoint([position.lng, position.lat]);
       } else if (!isWaypoint) {
         setEndingPoint([position.lng, position.lat]);
       }

       // Update route
       updateRoute();
     });

     // Add popup if location info exists
     if (!isWaypoint) {
       const location = isStart ? selectedStartLocation : selectedEndLocation;
       const timeKey = isStart ? "startTime" : "endTime";

       if (location && location[timeKey]) {
         const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="popup-content">
            <h3 class="font-bold">${isStart ? "Departure" : "Arrival"}</h3>
            <p>${location[timeKey]}</p>
          </div>
        `);
         marker.setPopup(popup);
       }
     }

     return marker;
   };

    const updateRoute = () => {
      if (!map.current || !mapReady) return;

      // Remove existing route
      if (map.current.getLayer("route-line")) {
        map.current.removeLayer("route-line");
      }
      if (map.current.getSource("route")) {
        map.current.removeSource("route");
      }

      // Get current marker positions
      const coordinates = [];
      markersRef.current.forEach((marker) => {
        coordinates.push(marker.getLngLat().toArray());
      });

      // Add new route
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: coordinates,
              },
            },
          ],
        },
      });

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0078FF",
          "line-width": 3,
          "line-dasharray": [2, 1],
        },
      });
    };

  // Handle markers and routes
 useEffect(() => {
   if (!map.current || !mapReady) return;

   // Clear existing markers and routes
   markersRef.current.forEach((marker) => marker.remove());
   markersRef.current = [];

   if (waypointInputs && waypointInputs.length > 0) {
     const startCoords = getCoordinates(startingPoint, [76.2144, 10.5276]);
     const endCoords = getCoordinates(endingPoint, [76.6141, 8.8932]);

     // Add draggable markers
     const startMarker = createDraggableMarker(startCoords, true);
     const endMarker = createDraggableMarker(endCoords, false);
     markersRef.current.push(startMarker, endMarker);

     // Handle waypoints
     const isWaypoints3 =
       waypoints === 3 || (Array.isArray(waypoints) && waypoints.length === 3);

     if (isWaypoints3) {
       const midpoint = [
         (startCoords[0] + endCoords[0]) / 2,
         (startCoords[1] + endCoords[1]) / 2,
       ];
       const waypointMarker = createDraggableMarker(midpoint, false, true);
       markersRef.current.push(waypointMarker);
     }

     // Initial route update
     updateRoute();

     // Fit map bounds
     const bounds = new mapboxgl.LngLatBounds();
     markersRef.current.forEach((marker) => {
       bounds.extend(marker.getLngLat());
     });

     map.current.fitBounds(bounds, {
       padding: { top: 50, bottom: 50, left: 50, right: 50 },
       maxZoom: isWaypoints3 ? 12 : 10,
       pitch: isWaypoints3 ? 0 : 0,
       bearing: isWaypoints3 ? 0 : 0,
       duration: 2000,
     });
   }
 }, [
   mapReady,
   startingPoint,
   endingPoint,
   selectedStartLocation,
   selectedEndLocation,
   waypoints,
   waypointInputs,
 ]);

  return (
    <div className="w-full h-full relative">
      {isColor === "Preview" ? (
        <div className="absolute inset-0 w-md h-[20rem] top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 rounded-2xl">
          <MapPreview />
        </div>
      ) : (
        <div className="w-full h-full bg-[#121216] rounded-2xl overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      )}

      {/* {isWaypoints3 && (
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl">
          <span className="text-sm">
            Flight path activated with 3 waypoints!
          </span>
        </div>
      )} */}

      {mapError && (
        <div className="absolute bottom-2 right-2 z-10 bg-red-500 text-white px-4 py-2 rounded-xl">
          <span className="text-sm">Error loading map</span>
        </div>
      )}
    </div>
  );
}
