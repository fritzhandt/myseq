import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShapes() {
  const sphere1 = useRef<THREE.Mesh>(null);
  const sphere2 = useRef<THREE.Mesh>(null);
  const cube1 = useRef<THREE.Mesh>(null);
  const torus1 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sphere1.current) {
      sphere1.current.position.x = Math.sin(time * 0.5) * 3;
      sphere1.current.position.y = Math.cos(time * 0.3) * 2;
      sphere1.current.rotation.x += 0.01;
      sphere1.current.rotation.y += 0.01;
    }
    
    if (sphere2.current) {
      sphere2.current.position.x = Math.cos(time * 0.4) * -4;
      sphere2.current.position.y = Math.sin(time * 0.6) * 1.5;
      sphere2.current.rotation.z += 0.02;
    }
    
    if (cube1.current) {
      cube1.current.position.x = Math.sin(time * 0.3) * -2;
      cube1.current.position.y = Math.cos(time * 0.8) * -1.5;
      cube1.current.rotation.x += 0.015;
      cube1.current.rotation.y += 0.015;
    }
    
    if (torus1.current) {
      torus1.current.position.x = Math.cos(time * 0.7) * 2.5;
      torus1.current.position.y = Math.sin(time * 0.4) * -2;
      torus1.current.rotation.x += 0.02;
      torus1.current.rotation.z += 0.01;
    }
  });

  return (
    <>
      <Sphere ref={sphere1} args={[0.5, 16, 16]} position={[2, 1, -8]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.6} 
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      <Sphere ref={sphere2} args={[0.3, 16, 16]} position={[-3, 0, -10]}>
        <meshStandardMaterial 
          color="#6366f1" 
          transparent 
          opacity={0.4} 
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>
      
      <Box ref={cube1} args={[0.8, 0.8, 0.8]} position={[-1, -1, -6]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.5} 
          metalness={0.7}
          roughness={0.2}
        />
      </Box>
      
      <Torus ref={torus1} args={[0.6, 0.2, 16, 32]} position={[1, -2, -7]}>
        <meshStandardMaterial 
          color="#10b981" 
          transparent 
          opacity={0.6} 
          metalness={0.8}
          roughness={0.1}
        />
      </Torus>
    </>
  );
}

export default function HeroBackground3D() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[-10, -10, 5]} intensity={0.6} color="#fbbf24" />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}