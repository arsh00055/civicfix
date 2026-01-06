'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ParticleBackgroundProps {
  particleCount?: number;
  className?: string;
  colors?: string[];
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  particleCount = 100,
  className = '',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
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
        const camera = new THREE.PerspectiveCamera(
          75, 
          mountRef.current!.clientWidth / mountRef.current!.clientHeight, 
          0.1, 
          1000
        );
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'low-power'
        });

        renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current!.appendChild(renderer.domElement);

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 10;
          positions[i + 1] = (Math.random() - 0.5) * 10;
          positions[i + 2] = (Math.random() - 0.5) * 10;

          const color = colors[Math.floor(Math.random() * colors.length)];
          const rgb = hexToRgb(color);
          particleColors[i] = ((rgb >> 16) & 255) / 255;
          particleColors[i + 1] = ((rgb >> 8) & 255) / 255;
          particleColors[i + 2] = (rgb & 255) / 255;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.05,
          vertexColors: true,
          transparent: true,
          opacity: 0.6
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        camera.position.z = 5;

        // Animation
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);

          particles.rotation.x += 0.001;
          particles.rotation.y += 0.002;

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
  }, [particleCount, colors]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 -z-10 ${className} ${isLoading ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}
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
export default dynamic(() => Promise.resolve(ParticleBackground), {
  ssr: false,
});