'use client'
import React, { use, useEffect, useRef } from 'react';
import { Physarum } from '@/Physarum/Physarum'; // Assuming Physarum.js is in the same directory

const PhysarumSimulation = () => {
  const containerRef = useRef(null);
  const physarum = useRef<Physarum | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    physarum.current = new Physarum({
      container: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    physarum.current.init();

    const animate = () => {
      physarum.current!.render();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-screen h-screen overflow-hidden fixed inset-0 z-10"
    />
  );
};

export default PhysarumSimulation;