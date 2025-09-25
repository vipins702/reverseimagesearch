import React, { useEffect, useRef } from 'react';

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number;
}

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="cosmic-background">
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
    </div>
  );
};

export default CosmicBackground;