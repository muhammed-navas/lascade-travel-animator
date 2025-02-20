import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ThreeJSCar = () => {
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      "/volk.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.rotation.y = 3.14;
        model.rotation.x = 0;
        scene.add(model);
        modelRef.current = model; // Store the model reference
      },
      undefined,
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;

    // Animation parameters
    const bounceSpeed = 3; // Speed of the bounce
    const bounceHeight = 0.05; // Height of the bounce
    const wobbleSpeed = 3; // Speed of the wobble
    const wobbleAmount = 0.05; // Amount of wobble rotation

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      if (modelRef.current) {
        const time = clock.getElapsedTime();

        // Bounce motion (up and down)
        modelRef.current.position.y =
          Math.sin(time * bounceSpeed) * bounceHeight;

        // Wobble motion (slight rotation)
        modelRef.current.rotation.z =
          Math.sin(time * wobbleSpeed) * wobbleAmount;

        // Subtle forward/backward tilt
        modelRef.current.rotation.x =
          0.7 + Math.sin(time * bounceSpeed * 2) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 z-[999] pointer-events-none"
    />
  );
};

export default ThreeJSCar;
 