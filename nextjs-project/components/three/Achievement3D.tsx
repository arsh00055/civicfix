'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface Achievement3DProps {
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  className?: string;
  size?: number;
}

const Achievement3D: React.FC<Achievement3DProps> = ({ 
  type, 
  className = '',
  size = 150
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getColor = () => {
    switch (type) {
      case 'bronze': return 0xcd7f32;
      case 'silver': return 0xc0c0c0;
      case 'gold': return 0xffd700;
      case 'platinum': return 0xe5e4e2;
      default: return 0x3b82f6;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const loadThree = async () => {
      try {
        const THREE = await import('three');
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        });

        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        mountRef.current?.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Trophy geometry
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.2, 32);
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 32);
        const cupGeometry = new THREE.ConeGeometry(0.6, 0.8, 32);

        const material = new THREE.MeshPhongMaterial({ 
          color: getColor(),
          shininess: 100,
          specular: 0x444444
        });

        const base = new THREE.Mesh(baseGeometry, material);
        const stem = new THREE.Mesh(stemGeometry, material);
        const cup = new THREE.Mesh(cupGeometry, material);

        stem.position.y = 0.3;
        cup.position.y = 0.9;

        const trophy = new THREE.Group();
        trophy.add(base);
        trophy.add(stem);
        trophy.add(cup);
        scene.add(trophy);

        camera.position.z = 3;

        // Animation
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          trophy.rotation.y += 0.02;
          
          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Cleanup
        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          renderer.dispose();
          mountRef.current?.removeChild(renderer.domElement);
        };
      } catch (error) {
        console.error('Failed to load Three.js:', error);
        setIsLoading(false);
      }
    };

    loadThree();
  }, [type, size]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <div ref={mountRef} className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
    </div>
  );
};

// Export as dynamic component
export default dynamic(() => Promise.resolve(Achievement3D), {
  ssr: false,
});