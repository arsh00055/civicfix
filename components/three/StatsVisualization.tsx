'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface StatsVisualizationProps {
  data: number[];
  colors?: string[];
  className?: string;
  width?: number;
  height?: number;
}

const StatsVisualization: React.FC<StatsVisualizationProps> = ({ 
  data, 
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  className = '',
  width = 300,
  height = 200
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hexToRgb = (hex: string): number => {
    return parseInt(hex.replace('#', ''), 16);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current || data.length === 0) return;

    const loadThree = async () => {
      try {
        const THREE = await import('three');
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true 
        });

        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        mountRef.current?.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Create bars for data visualization
        const maxData = Math.max(...data);
        const bars = new THREE.Group();

        data.forEach((value, index) => {
          const heightValue = (value / maxData) * 2;
          const geometry = new THREE.BoxGeometry(0.3, heightValue, 0.3);
          const material = new THREE.MeshPhongMaterial({ 
            color: hexToRgb(colors[index % colors.length]),
            transparent: true,
            opacity: 0.8
          });
          
          const bar = new THREE.Mesh(geometry, material);
          bar.position.x = (index - (data.length - 1) / 2) * 0.8;
          bar.position.y = heightValue / 2;
          
          bars.add(bar);
        });

        scene.add(bars);
        camera.position.z = 5;
        camera.position.y = 1;

        // Animation
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          bars.rotation.y += 0.01;
          
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
  }, [data, colors, width, height]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-gray-500 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <div 
        ref={mountRef} 
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

// Export as dynamic component
export default dynamic(() => Promise.resolve(StatsVisualization), {
  ssr: false,
});