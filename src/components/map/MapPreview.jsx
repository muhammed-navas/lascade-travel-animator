import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapPreview = ({ mapContainer, map, setMapReady, setMapError }) => {

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
        zoom: 14,
        pitch: 60,
        bearing: 30,
        attributionControl: true,
        duration: 50,
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
  }, []);

  return (
    <div className="w-1/2 h-3/4">
      <div ref={mapContainer} className="w-full rounded-2xl h-full" />
    </div>
  );
};

export default MapPreview;
