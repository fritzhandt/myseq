import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface Card3DProps {
  isHovered: boolean;
}

function Card3D({ isHovered }: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Tilt effect on hover
      const targetRotationX = isHovered ? -0.1 : 0;
      const targetRotationY = isHovered ? 0.1 : 0;
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.1);
      
      // Elevation effect
      const targetZ = isHovered ? 0.3 : 0;
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
      
      // Subtle pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
      if (isHovered) {
        meshRef.current.scale.setScalar(scale * 1.02);
      }
    }
  });

  return (
    <RoundedBox ref={meshRef} args={[2, 1.2, 0.1]} radius={0.05}>
      <meshStandardMaterial 
        color={isHovered ? "#1f2937" : "#374151"} 
        metalness={0.1}
        roughness={0.8}
        transparent
        opacity={0.1}
      />
    </RoundedBox>
  );
}

interface EventCard3DProps {
  children: React.ReactNode;
  className?: string;
}

export default function EventCard3D({ children, className = "" }: EventCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 2] }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[2, 2, 2]} intensity={0.5} />
          <Card3D isHovered={isHovered} />
        </Canvas>
      </div>
      
      {/* Content */}
      <div className={`relative z-10 transition-transform duration-300 ${
        isHovered ? 'transform translate-y-[-2px]' : ''
      }`}>
        {children}
      </div>
    </div>
  );
}