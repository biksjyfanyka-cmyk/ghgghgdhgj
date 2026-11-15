import React from 'react';
import { WeaponType, PlayerStats } from '../types/hvh';
import { WEAPONS } from '../utils/constants';
import { soundManager } from '../audio/SoundManager';
import { X, DollarSign } from 'lucide-react';

interface BuyMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onBuyWeapon: (weapon: WeaponType) => void;
  onBuyArmor: () => void;
}

export const BuyMenuModal: React.FC<BuyMenuModalProps> = ({
  isOpen,
  onClose,
  stats,
  onBuyWeapon,
  onBuyArmor,
}) => {
  if (!isOpen) return null;

  const weaponsList = Object.values(WEAPONS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-3xl bg-[#090e1c] border border-zinc-700/80 rounded-2xl shadow-2xl p-6 text-zinc-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white">CS:GO HVH BUY MENU</h2>
              <p className="text-xs text-zinc-400 font-mono">Current Balance: <span className="text-emerald-400 font-bold">${stats.money}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weapons List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {weaponsList.map((w) => {
            const canAfford = stats.money >= w.price;
            const isEquipped = stats.activeWeapon === w.id || stats.secondaryWeapon === w.id;

            return (
              <div
                key={w.id}
                onClick={() => {
                  if (canAfford) {
                    soundManager.playClick();
                    onBuyWeapon(w.id);
                  }
                }}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isEquipped
                    ? 'bg-[#00f0ff]/15 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : canAfford
                    ? 'bg-[#0f172a]/70 border-zinc-800 hover:border-amber-400 hover:bg-[#1e293b]'
                    : 'bg-zinc-900/40 border-zinc-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-extrabold text-sm text-white">{w.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span>DMG: {w.damage}</span>
                      <span>•</span>
                      <span>RPM: {w.rpm}</span>
                      {w.doubleTapEligible && (
                        <>
                          <span>•</span>
                          <span className="text-[#00f0ff] font-bold">DT READY</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-black font-mono ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${w.price}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-zinc-800/60">
                  <span className="text-zinc-500 uppercase">{w.category}</span>
                  {isEquipped ? (
                    <span className="text-[#00f0ff] font-bold text-[11px]">[EQUIPPED]</span>
                  ) : canAfford ? (
                    <span className="text-amber-400 font-bold text-[11px] hover:underline">BUY & EQUIP</span>
                  ) : (
                    <span className="text-zinc-600 text-[11px]">NOT ENOUGH MONEY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Armor + Kevlar quick buy */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div>
            <span className="font-bold text-xs text-white">Full Kevlar + Helmet ($1,000)</span>
            <p className="text-[10px] text-zinc-500">Provides 100 Armor and prevents instant headshot dinks</p>
          </div>
          <button
            onClick={() => {
              if (stats.money >= 1000) {
                soundManager.playClick();
                onBuyArmor();
              }
            }}
            disabled={stats.money < 1000 || stats.armor === 100}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              stats.armor === 100
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : stats.money >= 1000
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {stats.armor === 100 ? 'ARMOR FULL' : 'BUY ARMOR'}
          </button>
        </div>
      </div>
    </div>
  );
};
