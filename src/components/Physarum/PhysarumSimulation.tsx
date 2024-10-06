'use client'
import React, { useEffect, useRef } from 'react';
import { Physarum } from '@/Physarum/Physarum'; // Assuming Physarum.js is in the same directory

const PhysarumSimulation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const physarum = new Physarum({
      container: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    physarum.init();

    const animate = () => {
      physarum.render();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-screen h-screen overflow-hidden fixed inset-0"
    />
  );
};

export default PhysarumSimulation;