import React, { useState } from 'react';
import { CheatConfig, PlayerStats } from '../types/hvh';

interface KeybindsOverlayProps {
  config: CheatConfig;
  stats: PlayerStats;
}

export const KeybindsOverlay: React.FC<KeybindsOverlayProps> = ({ config, stats }) => {
  const [pos, setPos] = useState({ x: 20, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 220, e.clientX - dragOffset.x)),
      y: Math.max(10, Math.min(window.innerHeight - 260, e.clientY - dragOffset.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!config.keybindsList) return null;

  const binds = [
    {
      name: 'Doubletap',
      key: 'M4',
      mode: 'HOLD',
      active: config.doubleTap && stats.dtCharged,
      charging: config.doubleTap && !stats.dtCharged,
    },
    {
      name: 'Hide Shots',
      key: 'X',
      mode: 'TOGGLE',
      active: config.hideShots,
    },
    {
      name: 'Thirdperson',
      key: 'V',
      mode: 'TOGGLE',
      active: config.thirdperson,
    },
    {
      name: 'Auto Peek',
      key: 'C',
      mode: 'HOLD',
      active: stats.isAutoPeeking,
    },
    {
      name: 'Fake Duck',
      key: 'LCTRL',
      mode: 'HOLD',
      active: config.fakeDuck,
    },
    {
      name: 'Baim Force',
      key: 'F',
      mode: 'HOLD',
      active: config.preferBaim,
    },
    {
      name: 'Desync Invert',
      key: 'CAPS',
      mode: 'TOGGLE',
      active: config.desyncSide === 'left',
    },
  ];

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed z-40 w-52 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="rounded-lg bg-[#0a0f1d]/90 border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] backdrop-blur-md overflow-hidden text-xs">
        {/* Header / Drag Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between px-3 py-1.5 bg-[#0e1628] border-b border-[#00f0ff]/20 cursor-move"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
            <span className="font-bold text-zinc-200 tracking-wide">Keybinds</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">[neverlose]</span>
        </div>

        {/* Bind items */}
        <div className="p-2 space-y-1.5 font-mono">
          {binds.map((b) => (
            <div key={b.name} className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300">{b.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">[{b.mode}]</span>
                <span className="text-[10px] text-zinc-400">[{b.key}]</span>
                {b.charging ? (
                  <span className="text-[10px] text-amber-400 font-bold animate-pulse">CHARGE</span>
                ) : b.active ? (
                  <span className="text-[10px] text-[#00f0ff] font-bold drop-shadow-[0_0_4px_#00f0ff]">ON</span>
                ) : (
                  <span className="text-[10px] text-zinc-600">OFF</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
