import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function SpinningTorus() {
  const torusRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.x += 0.02;
      torusRef.current.rotation.y += 0.03;
    }
    
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.3;
      sphereRef.current.rotation.y += 0.04;
    }
  });

  return (
    <>
      <Torus ref={torusRef} args={[1, 0.3, 16, 32]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.8}
          roughness={0.2}
        />
      </Torus>
      <Sphere ref={sphereRef} args={[0.2, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
    </>
  );
}

export default function LoadingSpinner3D() {
  return (
    <div className="w-24 h-24 mx-auto">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <SpinningTorus />
      </Canvas>
    </div>
  );
}