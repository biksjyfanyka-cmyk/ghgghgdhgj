import React, { useState } from 'react';
import { PlayerStats, KillfeedEntry, ChatMessage, GameScore, CheatConfig, WeaponType } from '../types/hvh';
import { WEAPONS } from '../utils/constants';
import { Shield, Cross, Skull, Settings, Target } from 'lucide-react';

interface CSGOHudProps {
  stats: PlayerStats;
  score: GameScore;
  killfeed: KillfeedEntry[];
  chatMessages: ChatMessage[];
  config: CheatConfig;
  onSendMessage: (text: string) => void;
  onOpenMenu: () => void;
  onOpenBuyMenu: () => void;
  onSwitchWeapon: (type: WeaponType) => void;
  hitmarkerActive: boolean;
  hitmarkerDamage: number | null;
  isHeadshotHit: boolean;
}

export const CSGOHud: React.FC<CSGOHudProps> = ({
  stats,
  score,
  killfeed,
  chatMessages,
  config,
  onSendMessage,
  onOpenMenu,
  onOpenBuyMenu,
  onSwitchWeapon,
  hitmarkerActive,
  hitmarkerDamage,
  isHeadshotHit,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [showChatInput, setShowChatInput] = useState(false);

  const activeWeaponData = WEAPONS[stats.activeWeapon];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput.trim());
      setChatInput('');
      setShowChatInput(false);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans">
      {/* 1. SNIPER SCOPE OVERLAY (when scoped) */}
      {stats.isScoped && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          <div className="w-[85vh] h-[85vh] rounded-full border border-zinc-700/80 shadow-[0_0_100px_rgba(0,0,0,0.95)_inset] relative flex items-center justify-center">
            {/* Scope cross lines */}
            <div className="absolute w-full h-[1px] bg-red-600/70" />
            <div className="absolute h-full w-[1px] bg-red-600/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            {/* Range markers */}
            <div className="absolute -top-12 font-mono text-[10px] text-zinc-400">MIL-DOT 128 TICK</div>
          </div>
        </div>
      )}

      {/* 2. CROSSHAIR (when not scoped or for HvH dot) */}
      {!stats.isScoped && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          {/* Cyan/Green HvH Dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          {/* Subtle gap lines */}
          <div className="absolute w-5 h-[1.5px] bg-[#00f0ff]/60" />
          <div className="absolute h-5 w-[1.5px] bg-[#00f0ff]/60" />
        </div>
      )}

      {/* 3. HITMARKER EFFECT */}
      {hitmarkerActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping">
          <div className="relative w-8 h-8">
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />
          </div>
          {hitmarkerDamage && (
            <div
              className={`absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-black text-sm whitespace-nowrap ${
                isHeadshotHit ? 'text-red-500 drop-shadow-[0_0_8px_#ef4444]' : 'text-[#00f0ff]'
              }`}
            >
              -{hitmarkerDamage} {isHeadshotHit ? 'HEAD' : ''}
            </div>
          )}
        </div>
      )}

      {/* 4. TOP ROUND BANNER & TIMER */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#090d16]/85 border border-zinc-700/60 rounded-xl px-5 py-2 backdrop-blur-md shadow-2xl font-mono text-sm">
        {/* CT Score */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#38bdf8] text-lg">CT</span>
          <span className="text-2xl font-black text-white px-2 py-0.5 rounded bg-[#0284c7]/20 border border-[#0284c7]/40">
            {score.ctScore}
          </span>
        </div>

        {/* Round Timer & Info */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-amber-300 tracking-wider">
            {Math.floor(score.roundTimer / 60)}:{(score.roundTimer % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">ROUND {score.round}</span>
        </div>

        {/* T Score */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white px-2 py-0.5 rounded bg-[#eab308]/20 border border-[#eab308]/40">
            {score.tScore}
          </span>
          <span className="font-extrabold text-[#eab308] text-lg">T</span>
        </div>
      </div>

      {/* 5. TOP RIGHT KILLFEED */}
      <div className="absolute top-14 right-4 flex flex-col gap-1.5 max-w-sm pointer-events-none">
        {killfeed.slice(0, 5).map((kf) => (
          <div
            key={kf.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold backdrop-blur-md border ${
              kf.isLocalPlayerKiller
                ? 'bg-[#00f0ff]/15 border-[#00f0ff]/60 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : kf.isLocalPlayerVictim
                ? 'bg-red-950/70 border-red-500/60 text-red-200'
                : 'bg-[#0f172a]/80 border-zinc-700/40 text-zinc-300'
            }`}
          >
            <span className={kf.isLocalPlayerKiller ? 'text-[#00f0ff]' : 'text-zinc-200'}>{kf.killer}</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-amber-400">
              <span>{WEAPONS[kf.weapon]?.name || kf.weapon}</span>
              {kf.isDoubleTap && <span className="text-[#00f0ff] font-extrabold text-[9px]">[DT]</span>}
              {kf.isHeadshot && <Skull className="w-3 h-3 text-red-400" />}
              {kf.isWallbang && <Target className="w-3 h-3 text-purple-400" />}
            </div>
            <span className={kf.isLocalPlayerVictim ? 'text-red-400' : 'text-zinc-400'}>{kf.victim}</span>
          </div>
        ))}
      </div>

      {/* 6. TOP LEFT RADAR / MINIMAP */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="w-36 h-36 rounded-xl bg-[#090d18]/90 border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] relative overflow-hidden backdrop-blur-md p-1">
          {/* Map Grid */}
          <div className="w-full h-full border border-dashed border-zinc-700/50 rounded-lg relative flex items-center justify-center">
            {/* Site markers */}
            <span className="absolute top-3 left-4 text-[10px] font-bold text-red-400">A</span>
            <span className="absolute bottom-3 right-4 text-[10px] font-bold text-blue-400">B</span>
            <span className="absolute text-[8px] text-zinc-600 font-mono">MID</span>

            {/* Player blip */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#00f0ff]" />
            </div>

            {/* Enemy blips (Radar Hack) */}
            {config.radarHack && (
              <>
                <div className="absolute top-6 right-8 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-ping" />
                <div className="absolute bottom-8 left-7 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
              </>
            )}
          </div>
        </div>

        {/* Quick Menu Toggle Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white text-xs font-bold shadow-[0_0_12px_rgba(0,180,216,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>NEVERLOSE MENU [INSERT]</span>
          </button>
          <button
            onClick={onOpenBuyMenu}
            className="px-2.5 py-1 rounded-lg bg-[#1e293b]/90 border border-zinc-700 text-amber-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer"
          >
            BUY [B]
          </button>
        </div>
      </div>

      {/* 7. BOTTOM LEFT CS:GO HEALTH & ARMOR BAR */}
      <div className="absolute bottom-5 left-6 flex items-end gap-5">
        {/* Health */}
        <div className="flex items-center gap-3 bg-[#080d1a]/85 border border-zinc-800/80 rounded-2xl px-5 py-3 backdrop-blur-md shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Cross className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">HEALTH</span>
            <span
              className={`text-4xl font-black font-mono tracking-tight ${
                stats.hp < 30 ? 'text-red-500 animate-pulse' : 'text-white'
              }`}
            >
              {stats.hp}
            </span>
          </div>
        </div>

        {/* Armor */}
        <div className="flex items-center gap-3 bg-[#080d1a]/85 border border-zinc-800/80 rounded-2xl px-5 py-3 backdrop-blur-md shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#00f0ff]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              {stats.helmet ? 'ARMOR + HELM' : 'ARMOR'}
            </span>
            <span className="text-4xl font-black font-mono tracking-tight text-white">{stats.armor}</span>
          </div>
        </div>

        {/* Money */}
        <div className="bg-[#080d1a]/85 border border-zinc-800/80 rounded-2xl px-4 py-3 backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">MONEY</span>
          <div className="text-2xl font-black font-mono text-emerald-400">${stats.money}</div>
        </div>
      </div>

      {/* 8. BOTTOM RIGHT WEAPON & AMMO */}
      <div className="absolute bottom-5 right-6 flex items-end gap-5">
        {/* Weapon Slots Selector */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => onSwitchWeapon('scar20')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-left flex items-center justify-between gap-4 cursor-pointer ${
              stats.activeWeapon === 'scar20' || stats.activeWeapon === 'ssg08' || stats.activeWeapon === 'awp'
                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>1. {WEAPONS[stats.activeWeapon]?.name}</span>
            <span className="text-[10px] opacity-75">[PRIMARY]</span>
          </button>
          <button
            onClick={() => onSwitchWeapon('deagle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all text-left flex items-center justify-between gap-4 cursor-pointer ${
              stats.activeWeapon === 'deagle' || stats.activeWeapon === 'dualies'
                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>2. {WEAPONS.deagle.name}</span>
            <span className="text-[10px] opacity-75">[PISTOL]</span>
          </button>
        </div>

        {/* Ammo Counter */}
        <div className="bg-[#080d1a]/85 border border-zinc-800/80 rounded-2xl px-6 py-3 backdrop-blur-md shadow-2xl flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              {activeWeaponData?.name}
            </span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className={`text-4xl font-black ${stats.ammoInClip <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {stats.isReloading ? 'RELOAD' : stats.ammoInClip}
              </span>
              <span className="text-xl font-bold text-zinc-500">/</span>
              <span className="text-xl font-bold text-zinc-400">{stats.ammoReserve}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. BOTTOM LEFT CHAT WINDOW */}
      <div className="absolute bottom-24 left-6 w-80 pointer-events-auto">
        <div className="space-y-1 mb-2 font-mono text-xs max-h-36 overflow-y-auto">
          {chatMessages.slice(-6).map((msg) => (
            <div
              key={msg.id}
              className={`px-2.5 py-1 rounded bg-[#090d18]/80 backdrop-blur-sm border ${
                msg.isCheatKillsay ? 'border-[#00f0ff]/40 text-[#38bdf8]' : 'border-zinc-800 text-zinc-300'
              }`}
            >
              <span className="font-bold text-amber-400">[{msg.sender}]: </span>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Chat input trigger */}
        {showChatInput ? (
          <form onSubmit={handleChatSubmit} className="flex gap-1.5">
            <input
              type="text"
              autoFocus
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say in chat (e.g. 1 neverlose tap)..."
              className="flex-1 px-3 py-1 rounded-lg bg-black/80 border border-[#00f0ff]/50 text-white text-xs font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-[#00f0ff] text-black font-bold text-xs cursor-pointer"
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setShowChatInput(false)}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs cursor-pointer"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowChatInput(true)}
            className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-zinc-800 hover:text-white cursor-pointer"
          >
            [Press to Chat / Killsay]
          </button>
        )}
      </div>
    </div>
  );
};
