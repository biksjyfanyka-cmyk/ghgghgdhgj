import React from 'react';
import { PlayerStats, GameScore, CheatConfig } from '../types/hvh';

interface ScoreboardModalProps {
  isOpen: boolean;
  stats: PlayerStats;
  score: GameScore;
  config: CheatConfig;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  stats,
  score,
  config,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-4xl bg-[#090e1b] border border-zinc-700/80 rounded-2xl shadow-2xl p-6 text-zinc-200 font-mono">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-white">CS:GO HVH ARENA MATCH</h2>
            <p className="text-xs text-zinc-400">Map: hvh_dust2 | Server: 128 Tickrate | Pure HvH</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="text-amber-400">T: {score.tScore}</span>
            <span className="text-zinc-600">VS</span>
            <span className="text-cyan-400">CT: {score.ctScore}</span>
          </div>
        </div>

        {/* Terrorists Team */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-[#eab308]/15 border-l-4 border-[#eab308] px-3 py-1.5 rounded-r-lg mb-2 text-xs font-bold text-amber-300">
            <span>TERRORISTS ({score.tScore} ROUNDS WON)</span>
            <div className="flex gap-10 pr-4 text-zinc-400">
              <span className="w-12 text-center">K</span>
              <span className="w-12 text-center">D</span>
              <span className="w-12 text-center">HS%</span>
              <span className="w-12 text-center">PING</span>
              <span className="w-12 text-center">SCORE</span>
            </div>
          </div>

          {/* Local Player Row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-1.5 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] font-bold text-[10px]">
                {config.clantag}
              </span>
              <span className="font-extrabold text-white">NeverLose User (YOU)</span>
              <span className="text-[10px] text-emerald-400">[LIFETIME]</span>
            </div>

            <div className="flex gap-10 pr-4 font-bold text-zinc-200">
              <span className="w-12 text-center text-emerald-400">{stats.kills}</span>
              <span className="w-12 text-center text-red-400">{stats.deaths}</span>
              <span className="w-12 text-center text-cyan-400">
                {stats.kills > 0 ? Math.round((stats.headshots / stats.kills) * 100) : 0}%
              </span>
              <span className="w-12 text-center text-zinc-400">2ms</span>
              <span className="w-12 text-center text-amber-300">{stats.score}</span>
            </div>
          </div>
        </div>

        {/* Counter-Terrorists Team */}
        <div>
          <div className="flex items-center justify-between bg-[#0284c7]/15 border-l-4 border-[#0284c7] px-3 py-1.5 rounded-r-lg mb-2 text-xs font-bold text-cyan-300">
            <span>COUNTER-TERRORISTS ({score.ctScore} ROUNDS WON)</span>
            <div className="flex gap-10 pr-4 text-zinc-400">
              <span className="w-12 text-center">K</span>
              <span className="w-12 text-center">D</span>
              <span className="w-12 text-center">HS%</span>
              <span className="w-12 text-center">PING</span>
              <span className="w-12 text-center">SCORE</span>
            </div>
          </div>

          {/* Bot Rows */}
          {[
            { tag: 'gamesense', name: 'skeet_enjoyer_2017', k: 4, d: stats.kills, hs: '80%', ping: '12ms', pts: 120 },
            { tag: 'onetap.su', name: 'onetap_god_p100', k: 2, d: 3, hs: '66%', ping: '24ms', pts: 70 },
            { tag: 'fatalit.win', name: 'fatality_roll_abuser', k: 1, d: 2, hs: '100%', ping: '18ms', pts: 45 },
          ].map((bot) => (
            <div
              key={bot.name}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs mb-1"
            >
              <div className="flex items-center gap-3">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                  [{bot.tag}]
                </span>
                <span className="text-zinc-300">{bot.name}</span>
              </div>

              <div className="flex gap-10 pr-4 font-bold text-zinc-300">
                <span className="w-12 text-center text-zinc-200">{bot.k}</span>
                <span className="w-12 text-center text-zinc-400">{bot.d}</span>
                <span className="w-12 text-center text-zinc-400">{bot.hs}</span>
                <span className="w-12 text-center text-zinc-500">{bot.ping}</span>
                <span className="w-12 text-center text-zinc-400">{bot.pts}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-zinc-800 text-center text-xs text-zinc-500">
          Hold [TAB] to view scoreboard • Press [INSERT] for NeverLose Menu • Press [V] for Thirdperson
        </div>
      </div>
    </div>
  );
};
