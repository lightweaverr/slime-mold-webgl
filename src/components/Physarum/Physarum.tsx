'use client'

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { PhysarumSettings } from "../../Physarum/types";
import { initialSettings } from "../../Physarum/InitialSettings";


interface PhysarumProps {
  width: number | null;
  height: number | null;
} 

export const Physarum: React.FC<PhysarumProps> = ({width, height}) => {
  
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef<PhysarumSettings>(initialSettings);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const scene = useRef<THREE.Scene | null>(null);
  const camera = useRef<THREE.OrthographicCamera | null>(null);
  
  useEffect(() => {
    if (!canvas.current) return;

    if (!width || !height) {
      width = canvas.current.clientWidth;
      height = canvas.current.clientHeight;
    }


    
  }, [])


  return (
    <div> Physarum </div> 
  )
} 