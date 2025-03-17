import React, { Suspense, useRef, startTransition } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const ThreeDModel = () => {
  const { scene } = useGLTF('/models/metalware_v3.glb'); 
  const modelRef = useRef();
  const cameraRef = useRef();

  startTransition(() => {});

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold pt-1 text-center">Metalware - 3D Model</h2>
      <Canvas
        style={{ height: '300px', width: '100%' }}
        camera={{ position: [5, -0.3, 0], fov: 50 }} // Set the initial camera position
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.10} penumbra={1} />
        
        {/* Model */}
        <primitive object={scene} scale={0.115} position={[-5, -1.1, 0]} ref={modelRef} />
        
        {/* OrbitControls with restricted movement */}
        <OrbitControls
          ref={cameraRef}
          target={[0, 0, -0.2]} // Focus camera on the center
          enableRotate={false} // Disable rotation
          enableZoom={true} // Allow zoom in and out
          enablePan={true} // Allow panning
          maxPolarAngle={Math.PI / 2} // Limit vertical rotation (up and down)
          minDistance={3} // Limit zoom-out distance
          maxDistance={10} // Limit zoom-in distance
        />
      </Canvas>
    </div>
  );
};

const ModelC = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading model...</div>}>
        <ThreeDModel />
      </Suspense>
    </div>
  );
};

export default ModelC;
