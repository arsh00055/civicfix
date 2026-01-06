'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface LoadingAnimationProps {
  size?: number;
  className?: string;
  color?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 100,
  className = '',
  color = '#3b82f6'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hexToRgb = (hex: string): number => {
    return parseInt(hex.replace('#', ''), 16);
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
          alpha: true 
        });

        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        mountRef.current?.appendChild(renderer.domElement);

        // Create a rotating torus (donut)
        const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        const material = new THREE.MeshPhongMaterial({ 
          color: hexToRgb(color),
          transparent: true,
          opacity: 0.8,
          shininess: 100
        });

        const torus = new THREE.Mesh(geometry, material);
        scene.add(torus);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        camera.position.z = 5;

        // Animation
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          torus.rotation.x += 0.02;
          torus.rotation.y += 0.01;

          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

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
  }, [size, color]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" style={{ width: size / 2, height: size / 2 }}></div>
      </div>
    );
  }

  return <div ref={mountRef} className={className} style={{ width: size, height: size }} />;
};

// Export as dynamic component
export default dynamic(() => Promise.resolve(LoadingAnimation), {
  ssr: false,
});