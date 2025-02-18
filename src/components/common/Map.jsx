import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useWaypoints } from "../../context/WaypointsContext";
import not from "../../assets/not.png";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map() {
  const { waypoints } = useWaypoints();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (map.current) return;

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
      setMapError(error);
    });

    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.resize();
    }
  }, [mapReady]);

    // useEffect(() => {
    //   if (!map.current || !mapReady || !waypoints || waypoints.length === 0)
    //     return;

    //   if (map.current.getSource("circles")) {
    //     map.current.removeLayer("circle-layer");
    //     map.current.removeSource("circles");
    //   }

    //   const circleData = {
    //     type: "FeatureCollection",
    //     features: waypoints.map((waypoint) => ({
    //       type: "Feature",
    //       properties: {},
    //       geometry: {
    //         type: "Point",
    //         coordinates: [waypoint.longitude, waypoint.latitude],
    //       },
    //     })),
    //   };

    //   map.current.addSource("circles", {
    //     type: "geojson",
    //     data: circleData,
    //   });

    //   map.current.addLayer({
    //     id: "circle-layer",
    //     type: "circle",
    //     source: "circles",
    //     paint: {
    //       "circle-radius": 100,
    //       "circle-color": "#ff0000",
    //       "circle-opacity": 0.2,
    //       "circle-stroke-width": 2,
    //       "circle-stroke-color": "#ff0000",
    //     },
    //   });

    //   waypoints.forEach((waypoint) => {
    //     const marker = new mapboxgl.Marker()
    //       .setLngLat([waypoint.longitude, waypoint.latitude])
    //       .addTo(map.current);

    //     if (waypoint.name) {
    //       new mapboxgl.Popup({ offset: 25 })
    //         .setLngLat([waypoint.longitude, waypoint.latitude])
    //         .setHTML(`<h3>${waypoint.name}</h3>`)
    //         .addTo(map.current);
    //     }
    //   });

    //   if (waypoints.length > 1) {
    //     const bounds = new mapboxgl.LngLatBounds();
    //     waypoints.forEach((waypoint) => {
    //       bounds.extend([waypoint.longitude, waypoint.latitude]);
    //     });
    //     map.current.fitBounds(bounds, { padding: 50 });
    //   }
    // }, [waypoints, mapReady]);

  if (mapError) {
    return <div>Error loading map: {mapError.message}</div>;
  }

  return (
    <div className="w-full h-[90vh] ">
      <div ref={mapContainer} className="w-full h-[90vh] relative">
        { 2 > waypoints  && (
          <div className="w-fit flex items-center gap-2 rounded-xl px-4 py-2 bg-red-500 z-[99] text-white absolute bottom-2 right-1">
            <img src={not} alt="not" /> Oops! Preview mode needs at least 2 Way
            points to work.
          </div>
        )}
      </div>
      ;
    </div>
  );
}
