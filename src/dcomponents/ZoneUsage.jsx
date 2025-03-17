import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const zoneData = [
  { name: "SPRAY+ EPL", kWh: 150, category: "C-49" },
  { name: "PLATING", kWh: 80, category: "C-49" },
  { name: "COMPRESSOR", kWh: 100, category: "C-49" },
  { name: "BUFFING + VIBRATOR + ETP", kWh: 120, category: "C-49" },
  { name: "Terrace", kWh: 180, category: "C-49" },
  { name: "SPRAY+ EPL", kWh: 90, category: "C-50" },
  { name: "CHINA BUFFING", kWh: 60, category: "C-50" },
  { name: "BUFFING+CASTING M/C -7", kWh: 130, category: "C-50" },
  { name: "DIE CASTING", kWh: 170, category: "C-50" },
  { name: "RUMBLE", kWh: 180, category: "C-50" },
];

const categoryColors = {
  "C-49": "#008B8B",
  "C-50": "#FFA500",
};

const highlightColors = {
  "C-49": "#99FF99",
  "C-50": "#FFFF99",
};

const ZoneUsage = () => {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(30, width / height, 2.5, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // Disable orbit controls
    controls.enableZoom = false; // Disable zoom controls

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const cubes = zoneData.map((zone, index) => {
      const height = zone.category === "C-50" ? 0.7 : 1;
      const width = zone.category === "C-49" ? 2 : 2;
      const depth = zone.category === "C-50" ? 2.4 : 2.4;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshBasicMaterial({
        color: categoryColors[zone.category],
      });

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: highlightColors[zone.category] });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

      const cube = new THREE.Mesh(geometry, material);
      const floor = index % 5;
      const building = Math.floor(index / 5);

      cube.position.set(building * 5 - 3, floor * height - 2 + height / 2, 0);
      edges.position.set(building * 5 - 3, floor * height - 2 + height / 2, 0);

      cube.userData = { ...zone, originalColor: categoryColors[zone.category] };

      scene.add(cube);
      scene.add(edges);
      return cube;
    });

    // Set a better camera perspective
    camera.position.set(8, 0, 9);
    camera.lookAt(0, 0, 0);

    const handleMouseMove = (event) => {
      setTimeout(() => {
        const rect = mount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cubes);
    
        cubes.forEach(cube => {
          cube.material.color.set(cube.userData.originalColor);
        });
    
        if (intersects.length > 0) {
          const intersected = intersects[0].object;
          intersected.material.color.set(highlightColors[intersected.userData.category]);
          setHoveredZone(intersected.userData);
    
          tooltipRef.current.style.display = "block";
          tooltipRef.current.style.left = `${event.clientX - rect.left - 1}px`;
          tooltipRef.current.style.top = `${event.clientY - rect.top - 1}px`;
          tooltipRef.current.innerHTML = `${intersected.userData.name}: ${intersected.userData.kWh} kWh`;
    
          mount.style.cursor = "pointer"; 
        } else {
          setHoveredZone(null);
          tooltipRef.current.style.display = "none";
          mount.style.cursor = "default";  
        }
      }, 0);
    };

    const handleMouseClick = () => {
      if (hoveredZone) {
        navigate(`/zone/${hoveredZone.name}`);
      }
    };

    mount.addEventListener("mousemove", handleMouseMove);
    mount.addEventListener("click", handleMouseClick);

    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mount) {
        mount.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("mousemove", handleMouseMove);
      mount.removeEventListener("click", handleMouseClick);
    };
  }, [navigate]);

  return (
<>
  <div className="relative bg-white p-5 rounded-lg shadow-lg w-full">
    <div ref={mountRef} className="w-full h-[50vh] overflow-hidden relative" />
    <div className="flex space-x-12 pb-2 justify-center">
      <div className="bg-[#008B8B] text-white px-4 py-3 rounded-lg shadow-lg border-2 border-[#99FF99] text-lg font-bold">
        C-49
      </div>
      <div className="bg-[#FFA500] text-white px-4 py-3 rounded-lg shadow-lg border-2 border-[#FFFF99] text-lg font-bold">
        C-50
      </div>
    </div>
  </div>
  <div
    ref={tooltipRef}
    className="absolute bg-white p-2 border border-black hidden pointer-events-none"
  />
</>
  );
};

export default ZoneUsage;