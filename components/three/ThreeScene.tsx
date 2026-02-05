'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ThreeSceneProps {
  className?: string;
  backgroundColor?: string;
  showCube?: boolean;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  className = '',
  backgroundColor = 'transparent',
  showCube = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hexToRgb = (hex: string): number => {
    if (hex === 'transparent') return 0x000000;
    return parseInt(hex.replace('#', ''), 16);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const loadThree = async () => {
      try {
        const THREE = await import('three');
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current!.clientWidth / mountRef.current!.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: backgroundColor === 'transparent' 
        });

        renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
        if (backgroundColor !== 'transparent') {
          renderer.setClearColor(hexToRgb(backgroundColor), 1);
        } else {
          renderer.setClearColor(0x000000, 0);
        }
        mountRef.current!.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        let cube: THREE.Mesh | null = null;
        if (showCube) {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshPhongMaterial({ 
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.8
          });
          cube = new THREE.Mesh(geometry, material);
          scene.add(cube);
        }

        camera.position.z = 3;

        // Animation
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
          }
          
          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Handle resize
        const handleResize = () => {
          if (!mountRef.current) return;
          camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
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
  }, [backgroundColor, showCube]);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className} ${isLoading ? 'bg-gray-100' : ''}`}
      style={{ minHeight: '200px' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

// Export as dynamic component
export default dynamic(() => Promise.resolve(ThreeScene), {
  ssr: false,
});