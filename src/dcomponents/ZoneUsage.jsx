import React, { useEffect, useRef, useState, useContext } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import moment from "moment-timezone";
import { DateContext } from "../contexts/DateContext";
const categoryColors = {
  "C-49": "#008B8B",
  "C-50": "#FFA500",
};

const highlightColors = {
  "C-49": "#99FF99",
  "C-50": "#FFFF99",
};

const ZoneUsage = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get date from context
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meterToZoneMap = {
    1: { name: "SPRAY+ EPL", category: "C-49" },
    2: { name: "PLATING", category: "C-49" },
    3: { name: "COMPRESSOR", category: "C-49" },
    4: { name: "BUFFING + VIBRATOR + ETP", category: "C-49" },
    5: { name: "TERRACE", category: "C-49" },
    6: { name: "SPRAY+ EPL", category: "C-50" },
    7: { name: "CHINA BUFFING", category: "C-50" },
    8: { name: "BUFFING+CASTING M/C", category: "C-50" },
    9: { name: "DIE CASTING", category: "C-50" },
    10: { name: "RUMBLE", category: "C-50" },
    11: { name: "TOOL ROOM", category: "C-50" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        const response = await fetch(
          `http://localhost:3001/api/econsumption?date=${globalSelectedDate}&currentDateTime=${currentDateTime}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Invalid response: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = data.consumptionData
          .filter((item) => meterToZoneMap[item.energy_meter_id])
          .map((item) => {
            const zoneInfo = meterToZoneMap[item.energy_meter_id];
            return {
              name: zoneInfo.name,
              kWh: parseFloat(item.consumption) || 0,
              category: zoneInfo.category,
            };
          });

        setZoneData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalSelectedDate]); // Fetch data when the global date changes

  useEffect(() => {
    if (loading || error || !mountRef.current || zoneData.length === 0) return;

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
    controls.enabled = false;
    controls.enableZoom = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentIntersected = null;

    const cubes = zoneData.map((zone, index) => {
      const height = zone.category === "C-50" ? 0.7 : 1;
      const width = zone.category === "C-49" ? 2 : 2;
      const depth = zone.category === "C-50" ? 2.4 : 2.4;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshBasicMaterial({
        color: categoryColors[zone.category],
      });

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: highlightColors[zone.category],
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

      const cube = new THREE.Mesh(geometry, material);

      let xPos, yPos;
      if (zone.category === "C-49") {
        xPos = -3;
        yPos = (index % 5) * height - 2 + height / 2;
      } else {
        xPos = 2;
        yPos = ((index - 5) % 6) * height - 2 + height / 2;
      }

      cube.position.set(xPos, yPos, 0);
      edges.position.set(xPos, yPos, 0);

      cube.userData = { ...zone, originalColor: categoryColors[zone.category] };

      scene.add(cube);
      scene.add(edges);
      return cube;
    });

    camera.position.set(8, 0, 9);
    camera.lookAt(0, 0, 0);

    const checkIntersection = (x, y) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubes);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected !== currentIntersected) {
          // Reset previous intersection
          if (currentIntersected) {
            currentIntersected.material.color.set(currentIntersected.userData.originalColor);
          }

          // Set new intersection
          currentIntersected = intersected;
          intersected.material.color.set(highlightColors[intersected.userData.category]);
          setHoveredZone(intersected.userData);

          tooltipRef.current.style.display = "block";
          tooltipRef.current.style.left = `${x + 10}px`;
          tooltipRef.current.style.top = `${y + 10}px`;
          tooltipRef.current.innerHTML = `${intersected.userData.name}: ${intersected.userData.kWh} kWh`;

          mount.style.cursor = "pointer";
        }
        return true;
      } else {
        if (currentIntersected) {
          currentIntersected.material.color.set(currentIntersected.userData.originalColor);
          currentIntersected = null;
        }
        setHoveredZone(null);
        tooltipRef.current.style.display = "none";
        mount.style.cursor = "default";
        return false;
      }
    };

    const handleMouseMove = (event) => {
      checkIntersection(event.clientX, event.clientY);
    };

    const handleMouseOver = (event) => {
      // This ensures the tooltip stays visible when mouse stops moving but stays over a cube
      if (!checkIntersection(event.clientX, event.clientY)) {
        tooltipRef.current.style.display = "none";
      }
    };

    mount.addEventListener("mousemove", handleMouseMove);
    mount.addEventListener("mouseover", handleMouseOver);

    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
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
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("mousemove", handleMouseMove);
      mount.removeEventListener("mouseover", handleMouseOver);
    };
  }, [zoneData, loading, error]); // Removed globalSelectedDate from dependency array to avoid re-initialization

  if (loading) return <div className="text-center py-8">Loading zone data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (zoneData.length === 0) return <div className="text-center py-8">No zone data available</div>;

  return (
    <>
      <div className="relative bg-white p-5 rounded-lg shadow-md w-full flex flex-col space-y-8">
        <h2 className="text-xl font-semibold p-2">Zonal Usage</h2>
        <div ref={mountRef} className="w-full h-[60%] xl-w-full overflow-hidden relative" />
        <div className="flex space-x-12 pb-2 justify-center items-start">
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
        className="fixed bg-white p-2 border border-black rounded shadow-lg text-sm hidden pointer-events-none z-50"
        style={{ transform: 'translate(10px, 10px)' }}
      />
    </>
  );
};

export default ZoneUsage;