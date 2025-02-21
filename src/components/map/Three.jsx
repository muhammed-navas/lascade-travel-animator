import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ThreeJSCar = () => {
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    // Basic scene setup with minimal configuration
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    // Set fixed size for the model display
    renderer.setSize(300, 300);
    camera.position.z = 3;

    // Simple lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));

    // Load GLB model with simplified positioning
    const loader = new GLTFLoader();
    loader.load(
      "/volk.glb",
      (gltf) => {
        const model = gltf.scene;

        // Fixed scale and rotation
        model.scale.set(0.9, 0.9, 0.9);
        model.rotation.y = Math.PI;

        scene.add(model);
        modelRef.current = model;

        // Simple animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          if (modelRef.current) {
            // Gentle floating animation
            // modelRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.5;
            // Subtle rotation
            // modelRef.current.rotation.y = Math.PI + Math.sin(Date.now() * 0.001) * 0.9;
          }

          renderer.render(scene, camera);
        };

        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    return () => {
      // Clean up
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute  inset-0 top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 "
    />
  );
};

export default ThreeJSCar;
