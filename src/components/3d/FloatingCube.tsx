import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingGeometryProps {
  isHovered: boolean;
}

function FloatingGeometry({ isHovered }: FloatingGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      
      // Enhanced hover effects
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <Box ref={meshRef} args={[1, 1, 1]}>
      <meshStandardMaterial 
        color={isHovered ? "#3b82f6" : "#6366f1"} 
        metalness={0.8}
        roughness={0.2}
      />
    </Box>
  );
}

interface FloatingCubeProps {
  className?: string;
}

export default function FloatingCube({ className = "" }: FloatingCubeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`w-24 h-24 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FloatingGeometry isHovered={isHovered} />
      </Canvas>
    </div>
  );
}