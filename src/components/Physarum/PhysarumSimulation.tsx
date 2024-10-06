'use client'
import React, { use, useEffect, useRef } from 'react';
import { Physarum } from '@/Physarum/Physarum';

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

    return () => {

      if (physarum.current) {
        physarum.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen fixed inset-0 z-10"
    />
  );
};

export default PhysarumSimulation;