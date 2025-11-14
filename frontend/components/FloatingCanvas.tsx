'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const particleCount = 5000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    ref.current.rotation.x = time * 0.05;
    ref.current.rotation.y = time * 0.075;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!orbsRef.current) return;
    const time = state.clock.getElapsedTime();
    orbsRef.current.children.forEach((orb, i) => {
      orb.position.y = Math.sin(time + i) * 0.5;
      orb.position.x = Math.cos(time * 0.5 + i) * 2;
    });
  });

  return (
    <group ref={orbsRef}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[i * 2 - 4, 0, -5]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}
            emissive={i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function FloatingCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleField />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}