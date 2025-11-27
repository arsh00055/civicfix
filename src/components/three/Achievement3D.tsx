import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Achievement3DProps {
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  className?: string;
}

const Achievement3D: React.FC<Achievement3DProps> = ({ type, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

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
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(150, 150);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

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
      shininess: 100
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
    const animate = () => {
      requestAnimationFrame(animate);
      
      trophy.rotation.y += 0.02;
      
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [type]);

  return <div ref={mountRef} className={className} />;
};

export default Achievement3D;