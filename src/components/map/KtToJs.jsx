import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const RouteAnimator = ({
  routePoints,
  fps = 30,
  velocity = 0.001, // Reduced velocity for smoother animation
  onAnimationEnd,
  onAnimationFrame,
}) => {
  const mapContainer = useRef(null);
  const threeContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [pathSegments, setPathSegments] = useState([]);
  const animationRef = useRef(null);

  // Calculate path segments from routePoints
  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;

    // Convert GPS coordinates to 3D coordinates
    const segments = [];
    const start = routePoints[0];
    const end = routePoints[1];

    // Create path points with interpolation
    const pathPoints = [];
    const steps = 100; // Number of interpolation steps

    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      pathPoints.push({
        x: start.point.lng + (end.point.lng - start.point.lng) * t,
        y: 0, // Height above ground
        z: -(start.point.lat + (end.point.lat - start.point.lat) * t), // Negate for Three.js coordinate system
      });
    }

    segments.push(pathPoints);
    setPathSegments(segments);
  }, [routePoints]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainer.current) return;

    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(
      75,
      threeContainer.current.clientWidth / threeContainer.current.clientHeight,
      0.1,
      1000
    );
    newCamera.position.set(0, 5, 10);
    newCamera.lookAt(0, 0, 0);

    const newRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    newRenderer.setSize(
      threeContainer.current.clientWidth,
      threeContainer.current.clientHeight
    );
    threeContainer.current.appendChild(newRenderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    newScene.add(ambientLight);
    newScene.add(directionalLight);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    // Handle resize
    const handleResize = () => {
      if (!threeContainer.current || !newCamera || !newRenderer) return;

      newCamera.aspect =
        threeContainer.current.clientWidth /
        threeContainer.current.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(
        threeContainer.current.clientWidth,
        threeContainer.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      newRenderer.dispose();
      if (threeContainer.current?.contains(newRenderer.domElement)) {
        threeContainer.current.removeChild(newRenderer.domElement);
      }
    };
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current || !routePoints || routePoints.length === 0)
      return;

    const initialCenter = routePoints[0]?.point || { lng: -74.5, lat: 40 };

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 12,
    });

    newMap.on("load", () => {
      if (routePoints.length >= 2) {
        const coordinates = routePoints.map((point) => [
          point.point.lng,
          point.point.lat,
        ]);

        newMap.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
        });

        newMap.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });

        // Fit bounds to show the entire route
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord) => bounds.extend(coord));
        newMap.fitBounds(bounds, { padding: 50 });
      }
    });

    setMap(newMap);

    return () => newMap.remove();
  }, [routePoints]);

  // Load 3D model
  const loadModel = async () => {
    if (!scene) return null;

    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        "/volk.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(0.5, 0.5, 0.5);
          scene.add(model);
          setVehicle(model);
          resolve(model);
        },
        (progress) => {
          console.log(
            `Loading model: ${(progress.loaded / progress.total) * 100}%`
          );
        },
        (error) => {
          console.error("Error loading model:", error);
          reject(error);
        }
      );
    });
  };

  // Animation function
  const animate = (path, duration) => {
    if (!vehicle || !renderer || !scene || !camera) return;

    let start = null;
    const points = path.map((p) => new THREE.Vector3(p.x, p.y, p.z));

    if (points.length < 2) {
      console.error("Not enough points for animation");
      return;
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const frameTime = 1000 / fps;
    let lastFrameTime = 0;

    const animateFrame = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        if (timestamp - lastFrameTime >= frameTime) {
          const position = curve.getPoint(progress);
          vehicle.position.copy(position);

          if (progress < 0.99) {
            const tangent = curve.getTangent(progress);
            const lookTarget = new THREE.Vector3().copy(position).add(tangent);
            vehicle.lookAt(lookTarget);
          }

          const cameraOffset = new THREE.Vector3(0, 3, 5);
          const cameraPosition = new THREE.Vector3()
            .copy(position)
            .add(cameraOffset);
          camera.position.copy(cameraPosition);
          camera.lookAt(position);

          renderer.render(scene, camera);
          onAnimationFrame?.(progress);

          lastFrameTime = timestamp;
        }

        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        renderer.render(scene, camera);
        onAnimationEnd?.();
      }
    };

    animationRef.current = requestAnimationFrame(animateFrame);
  };

  // Start animation function
  const startAnimation = async () => {
    if (!scene || !pathSegments.length) {
      console.error("Cannot start animation: Scene or path segments not ready");
      return;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      if (!vehicle) {
        await loadModel();
      }

      const pathPoints = pathSegments[0];
      let pathLength = 0;

      for (let i = 1; i < pathPoints.length; i++) {
        const p1 = pathPoints[i - 1];
        const p2 = pathPoints[i];
        pathLength += Math.sqrt(
          Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
      }

      const duration = (pathLength / velocity) * 1000;
      animate(pathSegments[0], duration);
    } catch (error) {
      console.error("Animation startup error:", error);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Auto-start animation when ready
  useEffect(() => {
    if (scene && pathSegments.length > 0) {
      startAnimation();
    }
  }, [scene, pathSegments]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      <div
        ref={threeContainer}
        className="absolute inset-0 z-10 pointer-events-none"
      />
    </div>
  );
};

export default RouteAnimator;
