"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

const RobotPage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // === Basic Scene ===
    const scene = new THREE.Scene();

    // === Camera ===
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 100, 500);

    // === Renderer ===
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x06080d, 1);
    container.appendChild(renderer.domElement);

    // === Lighting ===
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    // === Model Loader ===
    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;

    loader.load(
      "/model/scene.gltf",
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, -0.5, 0);
        scene.add(model);
      },
      undefined,
      (error) => console.error("GLTF load error:", error)
    );

    // === Mousemove Smooth Rotation ===
    const mouse = { x: 0, y: 0 };
    window.addEventListener("mousemove", (e) => {
      if (!model) return;
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouse.y = (e.clientY - rect.top) / rect.height - 0.5;

      // Smooth GSAP tween for easing
      gsap.to(model.rotation, {
        duration: 1.2,
        x: mouse.y * Math.PI * 0.2,
        y: mouse.x * Math.PI * 0.12,
        ease: "power2.out",
      });
    });

    // === Animation Loop ===
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // === Responsive Resize ===
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // === Cleanup ===
    return () => {
      window.removeEventListener("resize", handleResize);
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-[600px] h-[600px] relative overflow-hidden"
    ></div>
  );
};

export default RobotPage;
