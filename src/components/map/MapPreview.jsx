import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";

// Set your Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxlbmpvc2VwaCIsImEiOiJjbTc0emVvdmMwY2VzMmtzY3RmbWg1ZTZlIn0.EHquBjE0wqvheFvHZaeKtg";

const MapPreview = () => {
  const { endingPoint, startingPoint } = useWaypoints();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const marker = useRef(null);
  const animationFrameId = useRef(null);
  const isAnimating = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      const container = mapContainer.current;
      if (!container) {
        console.error("Map container element is not available");
        return;
      }

      map.current = new mapboxgl.Map({
        container: container,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [76.2673, 9.9312], // Default center (Kochi)
        zoom: 14,
        pitch: 60,
        bearing: 30,
      });

      map.current.on("load", () => {
        // Add the route line source and layer
        map.current.addSource("routeLine", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        map.current.addLayer({
          id: "routeLine",
          type: "line",
          source: "routeLine",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ff0000",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        // Add animated line layer
        map.current.addSource("animatedLine", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        map.current.addLayer({
          id: "animatedLine",
          type: "line",
          source: "animatedLine",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#ff0000",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });
      });
    } catch (error) {
      console.error("Map initialization error:", error);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Helper function to get coordinates from location object
  const getCoordinates = async (location) => {
    if (!location) return null;

    // Handle if location already has coordinates
    if (typeof location === "object" && Array.isArray(location.center)) {
      return location.center;
    }

    const locationString =
      typeof location === "string"
        ? location
        : location.place_name || location.text || "";

    if (!locationString) {
      console.error("Invalid location format:", location);
      return [76.2673, 9.9312];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationString
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      } else {
        console.error("No location found for:", locationString);
        return [76.2673, 9.9312]; // Default fallback coordinates
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return [76.2673, 9.9312]; // Default fallback coordinates
    }
  };

  // Create location marker
  const createLocationMarker = (coordinates, color) => {
    const el = document.createElement("div");
    el.className = "location-marker";
    el.style.width = "15px";
    el.style.height = "15px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = color;
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

    return new mapboxgl.Marker(el).setLngLat(coordinates);
  };

  // Interpolate function for animation
  const interpolate = (start, end, fraction) => {
    return [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction,
    ];
  };

  // Function to fit bounds with custom zoom level
  const fitBoundsWithZoom = (startCoords, endCoords, padding = 100) => {
    const bounds = new mapboxgl.LngLatBounds()
      .extend(startCoords)
      .extend(endCoords);

    // Calculate the optimal zoom level based on the distance between points
    const distance = Math.sqrt(
      Math.pow(endCoords[0] - startCoords[0], 2) +
        Math.pow(endCoords[1] - startCoords[1], 2)
    );

    // Adjust zoom level based on distance
    const zoomLevel = Math.min(
      13, // Maximum zoom level
      Math.max(
        10, // Minimum zoom level
        14 - Math.log2(distance * 100) // Dynamic zoom calculation
      )
    );

    map.current.fitBounds(bounds, {
      padding,
      duration: 1000,
      maxZoom: zoomLevel,
    });
  };

  // Update map when start or end points change
  useEffect(() => {
    if (!map.current || !startingPoint || !endingPoint) return;

    // If map is loaded, update with locations
    if (map.current.loaded()) {
      updateMapWithLocations();
    } else {
      // If map isn't loaded yet, listen for the load event
      map.current.once("load", updateMapWithLocations);
    }
  }, [startingPoint, endingPoint]);

  const updateMapWithLocations = async () => {
    if (isAnimating.current) {
      cancelAnimationFrame(animationFrameId.current);
      isAnimating.current = false;
    }

    try {
      // Get coordinates from context or fetch if needed
      const startCoords = Array.isArray(startingPoint?.center)
        ? startingPoint.center
        : await getCoordinates(startingPoint);
      const endCoords = Array.isArray(endingPoint?.center)
        ? endingPoint.center
        : await getCoordinates(endingPoint);

      if (!startCoords || !endCoords) {
        console.error("Could not get valid coordinates");
        return;
      }

      // Remove existing markers
      if (startMarkerRef.current) startMarkerRef.current.remove();
      if (endMarkerRef.current) endMarkerRef.current.remove();
      if (marker.current) marker.current.remove();

      startMarkerRef.current = createLocationMarker(startCoords, "#00ff00");
      startMarkerRef.current.addTo(map.current);

      endMarkerRef.current = createLocationMarker(endCoords, "#ff0000");
      endMarkerRef.current.addTo(map.current);

      // Show popups initially
      startMarkerRef.current.togglePopup();
      endMarkerRef.current.togglePopup();

      // Create vehicle marker for animation
      const vehicleEl = document.createElement("div");
      vehicleEl.className = "vehicle-marker";
      vehicleEl.style.width = "20px";
      vehicleEl.style.height = "20px";
      vehicleEl.style.borderRadius = "50%";
      vehicleEl.style.backgroundColor = "#3a86ff";
      vehicleEl.style.border = "3px solid white";
      vehicleEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

      marker.current = new mapboxgl.Marker(vehicleEl)
        .setLngLat(startCoords)
        .addTo(map.current);

      // Initial fit bounds
      fitBoundsWithZoom(startCoords, endCoords);

      // Start animation after short delay
      setTimeout(() => {
        startAnimation(startCoords, endCoords);
      }, 1000);
    } catch (error) {
      console.error("Error updating map:", error);
    }
  };

  // Animation function
  const startAnimation = (startCoords, endCoords) => {
    isAnimating.current = true;
    let start = 0;
    const duration = 8000; // 8 seconds animation

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      // Get current point
      const currentPoint = interpolate(startCoords, endCoords, progress);

      // Update the animated line
      const lineCoordinates = [
        startCoords,
        ...Array.from({ length: 100 }, (_, i) => {
          const fraction = Math.min((i + 1) / 100, progress);
          return interpolate(startCoords, endCoords, fraction);
        }).filter(
          (_, i, arr) => i === arr.length - 1 || i / arr.length <= progress
        ),
      ];

      if (map.current.getSource("animatedLine")) {
        map.current.getSource("animatedLine").setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        });
      }

      // Update marker position
      if (marker.current) {
        marker.current.setLngLat(currentPoint);
      }

      // Follow animation with camera
      if (progress < 0.95) {
        map.current.easeTo({
          center: currentPoint,
          zoom: 8,
          bearing: 30,
          pitch: 60,
          duration: 100,
        });
      }

      if (progress < 1 && isAnimating.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;

        // Zoom out to show both points at the end of animation
        setTimeout(() => {
          fitBoundsWithZoom(startCoords, endCoords, 50);
        }, 500);
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);
  };

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-2xl" />
    </div>
  );
};

export default MapPreview;
