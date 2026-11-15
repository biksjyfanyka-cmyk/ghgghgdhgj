import React, { useState } from 'react';
import {
  CheatConfig,
  AntiAimPitch,
  AntiAimYaw,
  DesyncSide,
  ChamsMaterial,
  HitsoundChoice,
} from '../types/hvh';
import { AGENTS, KNIVES, GLOVES, PRESET_CONFIGS } from '../utils/constants';
import { soundManager } from '../audio/SoundManager';
import {
  Zap,
  Shield,
  Eye,
  Sliders,
  UserCheck,
  FileCode,
  X,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';

interface NeverLoseMenuProps {
  isOpen: boolean;
  onClose: () => void;
  config: CheatConfig;
  onUpdateConfig: (newConfig: CheatConfig) => void;
}

type TabType = 'rage' | 'antiaim' | 'visuals' | 'misc' | 'skins' | 'configs';

export const NeverLoseMenu: React.FC<NeverLoseMenuProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('rage');
  const [activeRageSubTab, setActiveRageSubTab] = useState<'main' | 'accuracy' | 'exploits'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const update = <K extends keyof CheatConfig>(key: K, value: CheatConfig[K]) => {
    soundManager.playClick();
    onUpdateConfig({ ...config, [key]: value });
  };

  const loadPreset = (presetName: string) => {
    const preset = PRESET_CONFIGS[presetName];
    if (preset) {
      soundManager.playClick();
      onUpdateConfig({ ...config, ...preset });
      setSaveStatus(`Loaded: ${presetName}`);
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
      {/* Main Window */}
      <div className="relative w-full max-w-4xl h-[640px] bg-[#080d19] border border-[#00f0ff]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-zinc-200 font-sans">
        {/* Top Header */}
        <div className="h-14 px-6 bg-[#0a1122] border-b border-[#00f0ff]/20 flex items-center justify-between shrink-0">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00b4d8] to-[#00f0ff] p-0.5 shadow-[0_0_12px_#00f0ff]">
              <div className="w-full h-full bg-[#080d19] rounded-[6px] flex items-center justify-center">
                <span className="font-black text-[#00f0ff] text-sm tracking-tighter">NL</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#0284c7] bg-clip-text text-transparent text-base">
                  NEVERLOSE.CC
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#00f0ff]/20 border border-[#00f0ff]/50 text-[#00f0ff] rounded">
                  V4.2
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">HvH CS:GO Edition | Lifetime Beta</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#060a14] border border-zinc-800 w-64 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features (aim, dt, chams)..."
              className="bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 w-full text-xs"
            />
          </div>

          {/* Close & User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-zinc-300">user: hvh_god</span>
              <span className="text-[10px] text-emerald-400 font-mono">STATUS: UNRATED HVH</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-zinc-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Layout (Sidebar + Tab Content) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-56 bg-[#070b16] border-r border-[#00f0ff]/15 p-3 flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('rage');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'rage'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Ragebot (Aimbot)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('antiaim');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'antiaim'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Anti-Aim (Angles)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('visuals');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'visuals'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Visuals & ESP</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('misc');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'misc'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Misc & Movement</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('skins');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'skins'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Agents & Skins</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('configs');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'configs'
                  ? 'bg-gradient-to-r from-[#00b4d8]/20 to-transparent border-l-4 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Configs & Lua</span>
            </button>

            {/* Notification alert bottom */}
            <div className="mt-auto p-2.5 rounded-xl bg-[#0e1628] border border-zinc-800 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tip: [INSERT]</span>
              </div>
              <p className="text-zinc-500 text-[10px]">Press INSERT anytime to toggle menu while in game.</p>
            </div>
          </div>

          {/* Main Tab Panels */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#080d19]">
            {saveStatus && (
              <div className="mb-4 px-4 py-2 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff] text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* TAB 1: RAGEBOT */}
            {activeTab === 'rage' && (
              <div className="space-y-5">
                {/* Subtabs */}
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <button
                    onClick={() => setActiveRageSubTab('main')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      activeRageSubTab === 'main' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-zinc-400'
                    }`}
                  >
                    Main
                  </button>
                  <button
                    onClick={() => setActiveRageSubTab('accuracy')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      activeRageSubTab === 'accuracy' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-zinc-400'
                    }`}
                  >
                    Accuracy & Hitboxes
                  </button>
                  <button
                    onClick={() => setActiveRageSubTab('exploits')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      activeRageSubTab === 'exploits' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-zinc-400'
                    }`}
                  >
                    Exploits (DT / Hide Shots)
                  </button>
                </div>

                {activeRageSubTab === 'main' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Aimbot Core */}
                    <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">Enable Ragebot</span>
                        <input
                          type="checkbox"
                          checked={config.ragebotEnabled}
                          onChange={(e) => update('ragebotEnabled', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Silent Aim (snapless)</span>
                        <input
                          type="checkbox"
                          checked={config.silentAim}
                          onChange={(e) => update('silentAim', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Auto Fire</span>
                        <input
                          type="checkbox"
                          checked={config.autoFire}
                          onChange={(e) => update('autoFire', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Auto Wall (Penetration)</span>
                        <input
                          type="checkbox"
                          checked={config.autoWall}
                          onChange={(e) => update('autoWall', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Auto Scope (Snipers)</span>
                        <input
                          type="checkbox"
                          checked={config.autoScope}
                          onChange={(e) => update('autoScope', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Auto Stop (between shots)</span>
                        <input
                          type="checkbox"
                          checked={config.autoStop}
                          onChange={(e) => update('autoStop', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Card 2: Resolvers */}
                    <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-white">Resolver V4.2</span>
                          <p className="text-[10px] text-zinc-500">Corrects enemy spinbot & desync angles</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.resolver}
                          onChange={(e) => update('resolver', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-300">Backtrack (200ms tick history)</span>
                          <p className="text-[10px] text-zinc-500">Shoot enemy past positions</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.backtrack}
                          onChange={(e) => update('backtrack', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300">Prefer Body Aim (Baim)</span>
                        <input
                          type="checkbox"
                          checked={config.preferBaim}
                          onChange={(e) => update('preferBaim', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeRageSubTab === 'accuracy' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hitchance & Min Damage */}
                    <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300">Hitchance ({config.hitChance}%)</span>
                          <span className="text-[#00f0ff] font-mono font-bold">{config.hitChance}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.hitChance}
                          onChange={(e) => update('hitChance', parseInt(e.target.value))}
                          className="w-full accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300">Minimum Damage ({config.minDamage} HP)</span>
                          <span className="text-[#00f0ff] font-mono font-bold">{config.minDamage} HP</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={config.minDamage}
                          onChange={(e) => update('minDamage', parseInt(e.target.value))}
                          className="w-full accent-[#00f0ff] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Target Hitbox selection */}
                    <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                      <span className="font-bold text-sm text-white">Target Hitbox</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['head', 'chest', 'stomach', 'multipoint'] as const).map((hb) => (
                          <button
                            key={hb}
                            onClick={() => update('targetHitbox', hb)}
                            className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                              config.targetHitbox === hb
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {hb}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeRageSubTab === 'exploits' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Double Tap */}
                    <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-[#00f0ff]">Double Tap (DT)</span>
                          <p className="text-[10px] text-zinc-400">Rapid 2-tick burst fire with tickbase shift</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.doubleTap}
                          onChange={(e) => update('doubleTap', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-300">Hide Shots (HS)</span>
                          <p className="text-[10px] text-zinc-500">Hides muzzle fire from enemy backtrack</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.hideShots}
                          onChange={(e) => update('hideShots', e.target.checked)}
                          className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ANTI-AIM */}
            {activeTab === 'antiaim' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Master AA & Pitch */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Enable Anti-Aim</span>
                      <input
                        type="checkbox"
                        checked={config.antiAimEnabled}
                        onChange={(e) => update('antiAimEnabled', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-2">Pitch Selection</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'pitch_down', label: 'Down (-89° HvH)' },
                            { id: 'pitch_up', label: 'Up (+89°)' },
                            { id: 'jitter', label: 'Jitter' },
                            { id: 'zero', label: 'Zero' },
                          ] as const
                        ).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => update('pitch', p.id as AntiAimPitch)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              config.pitch === p.id
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-2">Yaw Mode</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'spinbot', label: 'Spinbot' },
                            { id: 'backward', label: 'Backward' },
                            { id: 'jitter', label: 'Jitter' },
                            { id: 'lby_breaker', label: 'LBY Breaker' },
                          ] as const
                        ).map((y) => (
                          <button
                            key={y.id}
                            onClick={() => update('yaw', y.id as AntiAimYaw)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                              config.yaw === y.id
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {y.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {config.yaw === 'spinbot' && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300">Spin Speed ({config.yawSpeed})</span>
                          <span className="text-[#00f0ff] font-mono font-bold">{config.yawSpeed}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={config.yawSpeed}
                          onChange={(e) => update('yawSpeed', parseInt(e.target.value))}
                          className="w-full accent-[#00f0ff] cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Desync Angles & Fake Lag */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-white">Desync (Fake Angle)</span>
                        <p className="text-[10px] text-zinc-500">Forces enemies to shoot ghost model</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.desync}
                        onChange={(e) => update('desync', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Desync Angle ({config.desyncAngle}°)</span>
                        <span className="text-[#00f0ff] font-mono font-bold">{config.desyncAngle}° (max 58°)</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="58"
                        value={config.desyncAngle}
                        onChange={(e) => update('desyncAngle', parseInt(e.target.value))}
                        className="w-full accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-2">Desync Inverter Side</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'right', 'jitter'] as const).map((side) => (
                          <button
                            key={side}
                            onClick={() => update('desyncSide', side as DesyncSide)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-all cursor-pointer ${
                              config.desyncSide === side
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {side}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Fake Duck [HOLD CTRL]</span>
                      <input
                        type="checkbox"
                        checked={config.fakeDuck}
                        onChange={(e) => update('fakeDuck', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Slow Walk (Slide Gliding)</span>
                      <input
                        type="checkbox"
                        checked={config.slowWalk}
                        onChange={(e) => update('slowWalk', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VISUALS */}
            {activeTab === 'visuals' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ESP & Screen Info */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                    <span className="font-bold text-sm text-white">ESP Overlays</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Bounding Box ESP</span>
                      <input
                        type="checkbox"
                        checked={config.boxEsp}
                        onChange={(e) => update('boxEsp', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Name & Weapon ESP</span>
                      <input
                        type="checkbox"
                        checked={config.nameEsp}
                        onChange={(e) => update('nameEsp', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Bullet Tracers</span>
                      <input
                        type="checkbox"
                        checked={config.bulletTracers}
                        onChange={(e) => update('bulletTracers', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Damage Indicators (-100 HP)</span>
                      <input
                        type="checkbox"
                        checked={config.damageIndicators}
                        onChange={(e) => update('damageIndicators', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Show Desync Ghost Model</span>
                      <input
                        type="checkbox"
                        checked={config.showGhostModel}
                        onChange={(e) => update('showGhostModel', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">HvH Crosshair Indicators (DT, HS, etc.)</span>
                      <input
                        type="checkbox"
                        checked={config.indicators}
                        onChange={(e) => update('indicators', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Chams & Camera View */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-4">
                    <span className="font-bold text-sm text-white">Chams Materials</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Enable Chams</span>
                      <input
                        type="checkbox"
                        checked={config.chamsEnabled}
                        onChange={(e) => update('chamsEnabled', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-2">Chams Material</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['glow', 'metallic', 'wireframe', 'pulsing', 'glass', 'flat'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => update('chamsType', m as ChamsMaterial)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-all cursor-pointer ${
                              config.chamsType === m
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Field of View (FOV {config.fov})</span>
                        <span className="text-[#00f0ff] font-mono font-bold">{config.fov}°</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="130"
                        value={config.fov}
                        onChange={(e) => update('fov', parseInt(e.target.value))}
                        className="w-full accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Thirdperson Mode (Press V)</span>
                      <input
                        type="checkbox"
                        checked={config.thirdperson}
                        onChange={(e) => update('thirdperson', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    {/* Hitsounds */}
                    <div>
                      <span className="text-xs text-zinc-300 block mb-2">Hitsound Effect</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['neverlose', 'skeet', 'bell', 'cod', 'anime'] as const).map((hs) => (
                          <button
                            key={hs}
                            onClick={() => {
                              update('hitsound', hs as HitsoundChoice);
                              soundManager.playHitmarker(hs, config.hitsoundVolume);
                            }}
                            className={`px-2 py-1 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                              config.hitsound === hs
                                ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                            }`}
                          >
                            {hs}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MISC */}
            {activeTab === 'misc' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Movement & Auto-Peek */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                    <span className="font-bold text-sm text-white">Movement Automation</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-300">Auto Bunnyhop (Bhop)</span>
                        <p className="text-[10px] text-zinc-500">Hold spacebar to continuously hop</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.autoBhop}
                        onChange={(e) => update('autoBhop', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-300">Auto Peek (Key: C)</span>
                        <p className="text-[10px] text-zinc-500">Drops return marker, retreats after shot</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.autoPeek}
                        onChange={(e) => update('autoPeek', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Watermark Overlay</span>
                      <input
                        type="checkbox"
                        checked={config.watermark}
                        onChange={(e) => update('watermark', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300">Keybinds Floating List</span>
                      <input
                        type="checkbox"
                        checked={config.keybindsList}
                        onChange={(e) => update('keybindsList', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Killsay & Chat Spammer */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800/80 space-y-3">
                    <span className="font-bold text-sm text-white">Chat & Killsay</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-300">Automatic Killsay</span>
                        <p className="text-[10px] text-zinc-500">Sends HvH meme in chat upon killing opponent</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.killsay}
                        onChange={(e) => update('killsay', e.target.checked)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-1">Custom Killsay Message</span>
                      <input
                        type="text"
                        value={config.killsayText}
                        onChange={(e) => update('killsayText', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-[#00f0ff]"
                      />
                    </div>

                    <div>
                      <span className="text-xs text-zinc-300 block mb-1">Watermark Clantag</span>
                      <input
                        type="text"
                        value={config.clantag}
                        onChange={(e) => update('clantag', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-[#00f0ff]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SKINS & AGENTS */}
            {activeTab === 'skins' && (
              <div className="space-y-5">
                {/* Agent Selector */}
                <div>
                  <h3 className="font-bold text-sm text-white mb-2.5">Select CS:GO / CS2 Agent</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AGENTS.map((agent) => {
                      const isSelected = config.agentId === agent.id;
                      return (
                        <div
                          key={agent.id}
                          onClick={() => update('agentId', agent.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-[#00f0ff]/15 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                              : 'bg-[#0b1222] border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-white truncate">{agent.name}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                agent.team === 'T'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              }`}
                            >
                              {agent.team}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mb-2 line-clamp-2">{agent.description}</p>
                          <p className="text-[10px] text-[#00f0ff] font-mono italic">{agent.quote}</p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Knives and Gloves */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Knives */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800">
                    <h4 className="font-bold text-xs text-zinc-300 mb-2">CS:GO Knives</h4>
                    <div className="space-y-2">
                      {KNIVES.map((k) => (
                        <button
                          key={k.id}
                          onClick={() => update('knifeId', k.id)}
                          className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between cursor-pointer ${
                            config.knifeId === k.id
                              ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span>{k.name}</span>
                          <span className="text-[10px] text-zinc-500">{k.skin}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gloves */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800">
                    <h4 className="font-bold text-xs text-zinc-300 mb-2">Gloves</h4>
                    <div className="space-y-2">
                      {GLOVES.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => update('gloveId', g.id)}
                          className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between cursor-pointer ${
                            config.gloveId === g.id
                              ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff]'
                              : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span>{g.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CONFIGS & LUA */}
            {activeTab === 'configs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preset HvH configs */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800 space-y-3">
                    <span className="font-bold text-sm text-white">HvH Preset Configs</span>
                    <div className="space-y-2">
                      {Object.keys(PRESET_CONFIGS).map((presetKey) => (
                        <button
                          key={presetKey}
                          onClick={() => loadPreset(presetKey)}
                          className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 hover:bg-[#00f0ff]/15 border border-zinc-800 hover:border-[#00f0ff] text-left text-xs font-mono text-zinc-200 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span>{presetKey}</span>
                          <span className="text-[10px] text-[#00f0ff] font-bold">LOAD</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Config & Lua */}
                  <div className="p-4 rounded-xl bg-[#0b1222] border border-zinc-800 space-y-3">
                    <span className="font-bold text-sm text-white">Lua Console & Scripting</span>
                    <div className="h-32 p-2.5 rounded-lg bg-black/80 font-mono text-[10px] text-emerald-400 overflow-y-auto border border-zinc-800">
                      <div>[lua] Loading NeverLose API V4.2.0...</div>
                      <div>[lua] Hook: OnCreateMove registered.</div>
                      <div>[lua] Hook: OnPaintTraverse (watermark & keybinds) OK.</div>
                      <div>[lua] Resolver.V3: analyzing desync delta... [0x7FFA]</div>
                      <div>[lua] DoubleTap: tickbase shifted by 14 ticks.</div>
                      <div className="text-[#00f0ff]">[lua] Ready! Happy HvH tapping!</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const json = JSON.stringify(config, null, 2);
                          navigator.clipboard.writeText(json);
                          setSaveStatus('Config copied to clipboard!');
                          setTimeout(() => setSaveStatus(null), 2500);
                        }}
                        className="flex-1 py-2 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] text-xs font-mono font-bold cursor-pointer hover:bg-[#00f0ff]/30"
                      >
                        Export JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
