import React from 'react';
import { CheatConfig, PlayerStats } from '../types/hvh';

interface IndicatorsOverlayProps {
  config: CheatConfig;
  stats: PlayerStats;
}

export const IndicatorsOverlay: React.FC<IndicatorsOverlayProps> = ({ config, stats }) => {
  if (!config.indicators) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 translate-y-12 pointer-events-none select-none z-30 font-mono text-[11px] font-bold flex flex-col items-center gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
      {/* DT Indicator */}
      {config.doubleTap && (
        <div className="flex items-center gap-1.5">
          <span className={stats.dtCharged ? 'text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]' : 'text-red-500 animate-pulse'}>
            DT {stats.dtCharged ? '[READY]' : `[${Math.round(stats.dtRechargeProgress * 100)}%]`}
          </span>
          {/* Progress bar */}
          <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${stats.dtCharged ? 'bg-[#00f0ff]' : 'bg-red-500'}`}
              style={{ width: `${stats.dtRechargeProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Hide Shots */}
      {config.hideShots && <span className="text-[#38bdf8]">HS</span>}

      {/* Auto Peek */}
      {stats.isAutoPeeking && <span className="text-[#00e5ff] animate-bounce">PEEK ACTIVE</span>}

      {/* Prefer Baim */}
      {config.preferBaim && <span className="text-amber-400">BAIM</span>}

      {/* Desync Angle */}
      {config.antiAimEnabled && config.desync && (
        <span className="text-zinc-300">
          DESYNC: <span className="text-[#00f0ff]">{config.desyncAngle}°</span> [{config.desyncSide.toUpperCase()}]
        </span>
      )}

      {/* Resolver */}
      {config.resolver && (
        <span className="text-purple-400">
          RESOLVER: <span className="text-emerald-400">ACTIVE [LBY/ROLL]</span>
        </span>
      )}
    </div>
  );
};
