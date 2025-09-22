import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface Geometry3DProps {
  isHovered: boolean;
  isSelected: boolean;
}

function Geometry3D({ isHovered, isSelected }: Geometry3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation based on hover and selection
      if (isHovered || isSelected) {
        meshRef.current.rotation.x += 0.02;
        meshRef.current.rotation.y += 0.02;
      } else {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
      }
      
      // Scale animation
      const targetScale = isHovered ? 1.1 : isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Subtle floating
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3 + meshRef.current.position.x) * 0.1;
    }
  });

  return (
    <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
      <meshStandardMaterial 
        color={isSelected ? "#fbbf24" : isHovered ? "#3b82f6" : "#6366f1"} 
        metalness={0.6}
        roughness={0.3}
        transparent
        opacity={0.8}
      />
    </Box>
  );
}

interface AgeGroupButton3DProps {
  ageGroup: string;
  Icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export default function AgeGroupButton3D({ 
  ageGroup, 
  Icon, 
  isSelected, 
  onClick, 
  className 
}: AgeGroupButton3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative group">
      {/* 3D Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />
          <Geometry3D isHovered={isHovered} isSelected={isSelected} />
        </Canvas>
      </div>
      
      {/* Button Overlay */}
      <Button
        onClick={onClick}
        variant={isSelected ? "secondary" : "outline"}
        size="sm"
        className={`relative z-10 backdrop-blur-sm bg-transparent hover:bg-white/10 transition-all duration-300 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon className="mr-2 h-4 w-4" />
        {ageGroup}
      </Button>
    </div>
  );
}