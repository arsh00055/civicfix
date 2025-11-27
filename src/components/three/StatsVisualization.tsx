import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface StatsVisualizationProps {
  data: number[];
  colors?: number[];
  className?: string;
}

const StatsVisualization: React.FC<StatsVisualizationProps> = ({ 
  data, 
  colors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444],
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(300, 200);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

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
      const height = (value / maxData) * 2;
      const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
      const material = new THREE.MeshPhongMaterial({ 
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.8
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (index - (data.length - 1) / 2) * 0.8;
      bar.position.y = height / 2;
      
      bars.add(bar);
    });

    scene.add(bars);
    camera.position.z = 5;
    camera.position.y = 1;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      bars.rotation.y += 0.01;
      
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [data, colors]);

  return <div ref={mountRef} className={className} />;
};

export default StatsVisualization;