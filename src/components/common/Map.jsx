import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";
import car from "../../assets/car.png";
import plane from "../../assets/plane.png";
import destination from "../../assets/destination.png";
import MapPreview from "../map/MapPreview";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
     
export default function Map() {
  const { locations, setLocations, isColor } = useWaypoints();
  const mapContainer = useRef(null);
  const map = useRef(null); 
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef([]);
  const markerTypesRef = useRef([]);

  const validateCoordinates = useCallback((coords) => {
    if (!coords) return null;

    if (Array.isArray(coords)) {
      return {
        lng: Number(coords[0]),
        lat: Number(coords[1]),
      };
    }

    if (typeof coords === "object") {
      if ("coordinates" in coords) {
        return {
          lng: Number(coords.coordinates[0]),
          lat: Number(coords.coordinates[1]),
        };
      }
      if ("lng" in coords && "lat" in coords) {
        return {
          lng: Number(coords.lng),
          lat: Number(coords.lat),
        };
      }
    }

    return null;
  }, []);

  const getAddressFromCoordinates = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        return {
          address: data.features[0].place_name,
          coordinates: [lng, lat],
        };
      }

      return {
        address: "Unknown location",
        coordinates: [lng, lat],
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      return {
        address: "Error fetching address",
        coordinates: [lng, lat],
      };
    }
  };

    const createCurvedLine = useCallback((start, end) => {
      // Calculate the distance between points
      const dx = end.lng - start.lng;
      const dy = end.lat - start.lat;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Adjust curve intensity based on distance
      const curveIntensity = distance * 0.2;

      // Calculate midpoint
      const midPoint = {
        lng: (start.lng + end.lng) / 2,
        lat: (start.lat + end.lat) / 2,
      };

      // Calculate control points for smoother curves
      const controlPoint1 = {
        lng: midPoint.lng - dy * curveIntensity,
        lat: midPoint.lat + dx * curveIntensity,
      };

      const controlPoint2 = {
        lng: midPoint.lng + dy * curveIntensity,
        lat: midPoint.lat - dx * curveIntensity,
      };

      // Generate curve points using cubic Bezier
      const points = [];
      const steps = 100; // Increase number of points for smoother curve

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        points.push([
          start.lng * mt3 +
            3 * controlPoint1.lng * mt2 * t +
            3 * controlPoint2.lng * mt * t2 +
            end.lng * t3,

          start.lat * mt3 +
            3 * controlPoint1.lat * mt2 * t +
            3 * controlPoint2.lat * mt * t2 +
            end.lat * t3,
        ]);
      }

      return points;
    }, []);

 const updateRoute = useCallback(() => {
   if (!map.current || !mapReady) return;

   if (map.current.getLayer("route")) {
     map.current.removeLayer("route");
     map.current.removeSource("route");
   }

   const coordinates = markersRef.current
     .filter((marker) => marker)
     .map((marker) => {
       const lngLat = marker.getLngLat();
       return { lng: lngLat.lng, lat: lngLat.lat };
     });

   if (coordinates.length < 2) return;

   let routeCoordinates = [];
   for (let i = 0; i < coordinates.length - 1; i++) {
     const segment = createCurvedLine(coordinates[i], coordinates[i + 1]);
     routeCoordinates = routeCoordinates.concat(segment);
   }

   map.current.addSource("route", {
     type: "geojson",
     data: {
       type: "Feature",
       properties: {},
       geometry: {
         type: "LineString",
         coordinates: routeCoordinates,
       },
     },
   });

   map.current.addLayer({
     id: "route",
     type: "line",
     source: "route",
     layout: {
       "line-join": "round",
       "line-cap": "round",
     },
     paint: {
       "line-color": "#FF0000",
       "line-width": 4,
       "line-opacity": 0.8,
     },
   });
 }, [mapReady, createCurvedLine]);

  const handleMarkerDragEnd = useCallback(
    (index) => {
      return async () => {
        if (!markersRef.current[index]) return;

        const newLngLat = markersRef.current[index].getLngLat();
        const markerType = markerTypesRef.current[index];

        // Get address for new coordinates
        const locationData = await getAddressFromCoordinates(
          newLngLat.lng,
          newLngLat.lat
        );

        // Create a deep copy of locations
        const newLocations = JSON.parse(JSON.stringify(locations));

        // Update coordinates and address based on marker type
        if (markerType === "start") {
          newLocations.start = {
            ...newLocations.start,
            ...locationData,
          };
        } else if (markerType === "end") {
          newLocations.end = {
            ...newLocations.end,
            ...locationData,
          };
        } else if (markerType === "waypoint") {
          const waypointIndex = markerTypesRef.current
            .slice(0, index)
            .filter((type) => type === "waypoint").length;

          if (newLocations.waypoints[waypointIndex]) {
            newLocations.waypoints[waypointIndex] = {
              ...newLocations.waypoints[waypointIndex],
              ...locationData,
            };
          }
        }

        // Update locations in context
        setLocations(newLocations);

        // Update route
        updateRoute();
      };
    },
    [locations, setLocations, updateRoute]
  );



  const createMarker = useCallback(
    (coordinates, type, index) => {
      const validCoords = validateCoordinates(coordinates);
      if (!validCoords) {
        console.error("Invalid coordinates:", coordinates);
        return null;
      }

      const el = document.createElement("div");
      el.className = "custom-marker";

      const styles = {
        start: { icon: car },
        waypoint: { icon: plane },
        end: { icon: destination },
      };

      const style = styles[type];
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.backgroundImage = `url(${style.icon})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.cursor = "move";

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: true,
      }).setLngLat(validCoords);

      marker.on("dragend", handleMarkerDragEnd(index));

      return marker;
    },
    [handleMarkerDragEnd, validateCoordinates]
  );

 

  useEffect(() => {
    if (!map.current || !mapReady || !locations || isColor !== "Routes") return;

    markersRef.current = [];
    markerTypesRef.current = [];

    let markerIndex = 0;

    // Add markers
    if (locations.start) {
      const startMarker = createMarker(
        locations.start.coordinates,
        "start",
        markerIndex
      );
      if (startMarker) {
        markersRef.current.push(startMarker);
        markerTypesRef.current.push("start");
        markerIndex++;
      }
    }

    if (locations.waypoints) {
      locations.waypoints.forEach((waypoint) => {
        const marker = createMarker(
          waypoint.coordinates,
          "waypoint",
          markerIndex
        );
        if (marker) {
          markersRef.current.push(marker);
          markerTypesRef.current.push("waypoint");
          markerIndex++;
        }
      });
    }

    if (locations.end) {
      const endMarker = createMarker(
        locations.end.coordinates,
        "end",
        markerIndex
      );
      if (endMarker) {
        markersRef.current.push(endMarker);
        markerTypesRef.current.push("end");
      }
    }

    // Add markers to map
    markersRef.current.forEach((marker) => {
      if (marker) marker.addTo(map.current);
    });

    // Update route and fit bounds
    updateRoute();

    if (markersRef.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markersRef.current.forEach((marker) => {
        if (marker) bounds.extend(marker.getLngLat());
      });

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 9,
      });
    }
  }, [locations, mapReady, isColor, createMarker, updateRoute]);

  useEffect(() => {
    if (!mapContainer.current || !isColor || isColor !== "Routes") return;

    // Clear existing map instance if it exists
    if (map.current) {
      markersRef.current.forEach((marker) => marker?.remove());
      map.current.remove();
    }

    // Initialize new map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [76.52179, 9.590026],
      zoom: 8,
      pitch: 0,
      bearing: 0,
    });

    map.current.on("load", () => {
      setMapReady(true);
    });

    // Cleanup function
    return () => {
      if (map.current) {
        markersRef.current.forEach((marker) => marker?.remove());
        map.current.remove();
        map.current = null;
        setMapReady(false);
      }
    };
  }, [isColor]);

  return (
    <div className="w-full h-full bg-[#121216] rounded-2xl overflow-hidden">
      {isColor === "Routes" ? (
        <div className="w-full h-full  bg-[#121216] rounded-2xl overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      ) : (
        <div className="absolute  inset-0 w-md h-[20rem] top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 rounded-2xl">
          <MapPreview marker={markersRef} locations={locations} />
        </div>
      )}
    </div>
  );
}
