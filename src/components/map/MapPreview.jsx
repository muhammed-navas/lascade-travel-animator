import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
 

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapPreview = ({ marker, locations }) => {
  const endingPoint = locations.end.address;
  const startingPoint = locations.start.address;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const animationFrameId = useRef(null);
  const isAnimating = useRef(false);

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
        style: "mapbox://styles/mapbox/streets-v12",
        center: [76.2673, 9.9312],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });

      map.current.on("load", () => {
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

  const getCoordinates = async (location) => {
    if (!location) return null;

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
        return [76.2673, 9.9312];
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return [76.2673, 9.9312];
    }
  };

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

  const interpolate = (start, end, fraction) => {
    return [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction,
    ];
  };

  const fitBoundsWithZoom = (startCoords, endCoords, padding = 100) => {
    const bounds = new mapboxgl.LngLatBounds()
      .extend(startCoords)
      .extend(endCoords);

    map.current.fitBounds(bounds, {
      padding,
      duration: 1000,
      maxZoom: 12,
    });
  };

  useEffect(() => {
    if (!map.current || !startingPoint || !endingPoint) return;

    if (map.current.loaded()) {
      updateMapWithLocations();
    } else {
      map.current.once("load", updateMapWithLocations);
    }
  }, [startingPoint, endingPoint]);

  const updateMapWithLocations = async () => {
    if (isAnimating.current) {
      cancelAnimationFrame(animationFrameId.current);
      isAnimating.current = false;
    }

    try {
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

      if (startMarkerRef.current) startMarkerRef.current.remove();
      if (endMarkerRef.current) endMarkerRef.current.remove();
      startMarkerRef.current = createLocationMarker(startCoords, "#00ff00");
      startMarkerRef.current.addTo(map.current);

      endMarkerRef.current = createLocationMarker(endCoords, "#ff0000");
      endMarkerRef.current.addTo(map.current);

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

      map.current.flyTo({
        center: startCoords,
        zoom: 8,
        bearing: 30,
        pitch: 60,
        duration: 1000,
      });

      setTimeout(() => {
        startAnimation(startCoords, endCoords);
      }, 1000);
    } catch (error) {
      console.error("Error updating map:", error);
    }
  };

  const startAnimation = (startCoords, endCoords) => {
    isAnimating.current = true;
    let start = 0;
    const duration = 8000;

    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      const currentPoint = interpolate(startCoords, endCoords, progress);

      const lineCoordinates = [
        startCoords,
        ...Array.from({ length: 100 }, (_, i) => {
          const fraction = Math.min((i + 1) / 100, progress);
          return interpolate(startCoords, endCoords, fraction);
        }).filter(
          (_, i, arr) => i === arr.length - 1 || i / arr.length <= progress
        ),
      ];

      map.current.getSource("animatedLine").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: lineCoordinates,
        },
      });

      if (marker.current) {
        marker.current.setLngLat(currentPoint);
      }

      if (progress < 0.95) {
        map.current.easeTo({
          center: currentPoint,
          zoom: 9,
          bearing: 0,
          pitch: 45,
          duration: 100,
        });
      }

      if (progress < 1 && isAnimating.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        isAnimating.current = false;
        fitBoundsWithZoom(startCoords, endCoords, 50);
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
