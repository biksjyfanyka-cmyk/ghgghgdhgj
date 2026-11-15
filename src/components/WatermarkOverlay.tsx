import React, { useState, useEffect } from 'react';

interface WatermarkOverlayProps {
  clantag?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ clantag = 'NEVERLOSE.CC' }) => {
  const [fps, setFps] = useState(240);
  const [ping, setPing] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(235 + Math.random() * 15));
      setPing(Math.floor(2 + Math.random() * 3));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-3 right-4 z-40 pointer-events-none select-none">
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#0b101d]/90 border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-md text-xs font-mono">
        <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
        <span className="font-extrabold tracking-wider bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#0284c7] bg-clip-text text-transparent">
          {clantag}
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300">beta</span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300">user: <span className="text-[#38bdf8]">hvh_god</span></span>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-400">128 tick</span>
        <span className="text-zinc-600">|</span>
        <span className="text-emerald-400">{fps} fps</span>
        <span className="text-zinc-600">|</span>
        <span className="text-emerald-400">{ping} ms</span>
      </div>
    </div>
  );
};
