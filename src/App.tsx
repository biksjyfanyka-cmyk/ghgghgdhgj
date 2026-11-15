import { useEffect, useRef, useState, useCallback } from 'react';
import { HvHGameEngine } from './game/HvHGameEngine';
import { CheatConfig, PlayerStats, GameScore, KillfeedEntry, ChatMessage, WeaponType } from './types/hvh';
import { DEFAULT_CONFIG, WEAPONS } from './utils/constants';
import { CSGOHud } from './components/CSGOHud';
import { NeverLoseMenu } from './components/NeverLoseMenu';
import { WatermarkOverlay } from './components/WatermarkOverlay';
import { KeybindsOverlay } from './components/KeybindsOverlay';
import { IndicatorsOverlay } from './components/IndicatorsOverlay';
import { BuyMenuModal } from './components/BuyMenuModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { soundManager } from './audio/SoundManager';
import confetti from 'canvas-confetti';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<HvHGameEngine | null>(null);

  const [config, setConfig] = useState<CheatConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    armor: 100,
    helmet: true,
    kills: 0,
    deaths: 0,
    headshots: 0,
    score: 0,
    money: 16000,
    ammoInClip: WEAPONS.scar20.clipSize,
    ammoReserve: WEAPONS.scar20.maxAmmo,
    activeWeapon: 'scar20',
    secondaryWeapon: 'deagle',
    isReloading: false,
    isCrouching: false,
    isScoped: false,
    isAutoPeeking: false,
    dtCharged: true,
    dtRechargeProgress: 1,
    fakeAngle: 0,
    realAngle: 0,
  });

  const [score, setScore] = useState<GameScore>({
    ctScore: 0,
    tScore: 0,
    round: 1,
    roundTimer: 90,
    isWarmup: false,
  });

  const [killfeed, setKillfeed] = useState<KillfeedEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'SYSTEM',
      team: 'SPEC',
      text: 'Connected to [RU] NeverLose.cc 128 Tick HvH Arena #1',
    },
    {
      id: 'init-2',
      sender: 'NeverLose',
      team: 'T',
      text: 'Press [INSERT] to configure Ragebot, Anti-Aim & Skins.',
    },
  ]);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBuyMenuOpen, setIsBuyMenuOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Hitmarker state
  const [hitmarkerActive, setHitmarkerActive] = useState(false);
  const [hitmarkerDamage, setHitmarkerDamage] = useState<number | null>(null);
  const [isHeadshotHit, setIsHeadshotHit] = useState(false);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new HvHGameEngine(canvasRef.current, config);
    engineRef.current = engine;

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onScoreUpdate = (newScore) => {
      setScore({ ...newScore });
      if (newScore.tScore > 0 && newScore.tScore % 8 === 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };

    engine.onKillfeed = (kill) => {
      setKillfeed((prev) => [kill, ...prev.slice(0, 8)]);
    };

    engine.onChat = (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    engine.onHitmarker = (isHeadshot, dmg) => {
      setIsHeadshotHit(isHeadshot);
      setHitmarkerDamage(dmg);
      setHitmarkerActive(true);
      setTimeout(() => setHitmarkerActive(false), 220);
    };

    return () => {
      engine.destroy();
    };
  }, []);

  // Sync config updates with engine
  const handleUpdateConfig = useCallback((newConfig: CheatConfig) => {
    setConfig(newConfig);
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  }, []);

  // Global keydown listeners for menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.code === 'Insert') {
        e.preventDefault();
        soundManager.playClick();
        setIsMenuOpen((prev) => !prev);
      }

      if (e.code === 'KeyB') {
        e.preventDefault();
        soundManager.playClick();
        setIsBuyMenuOpen((prev) => !prev);
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        setIsScoreboardOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        setIsScoreboardOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSendMessage = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'You',
        team: 'T',
        text,
      },
    ]);
  };

  const handleBuyWeapon = (weapon: WeaponType) => {
    const w = WEAPONS[weapon];
    if (stats.money >= w.price) {
      const updatedMoney = stats.money - w.price;
      setStats((prev) => ({ ...prev, money: updatedMoney }));
      if (engineRef.current) {
        engineRef.current.stats.money = updatedMoney;
        engineRef.current.switchWeapon(weapon);
      }
      setIsBuyMenuOpen(false);
    }
  };

  const handleBuyArmor = () => {
    if (stats.money >= 1000 && stats.armor < 100) {
      const updatedMoney = stats.money - 1000;
      setStats((prev) => ({ ...prev, armor: 100, helmet: true, money: updatedMoney }));
      if (engineRef.current) {
        engineRef.current.stats.armor = 100;
        engineRef.current.stats.helmet = true;
        engineRef.current.stats.money = updatedMoney;
      }
    }
  };

  const handleSwitchWeapon = (weapon: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.switchWeapon(weapon);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair focus:outline-none"
        tabIndex={0}
      />

      {/* CS:GO HUD Overlay */}
      <CSGOHud
        stats={stats}
        score={score}
        killfeed={killfeed}
        chatMessages={chatMessages}
        config={config}
        onSendMessage={handleSendMessage}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenBuyMenu={() => setIsBuyMenuOpen(true)}
        onSwitchWeapon={handleSwitchWeapon}
        hitmarkerActive={hitmarkerActive}
        hitmarkerDamage={hitmarkerDamage}
        isHeadshotHit={isHeadshotHit}
      />

      {/* Overlays */}
      {config.watermark && <WatermarkOverlay clantag={config.clantag} />}
      {config.keybindsList && <KeybindsOverlay config={config} stats={stats} />}
      {config.indicators && <IndicatorsOverlay config={config} stats={stats} />}

      {/* NeverLose V4 Menu (Insert) */}
      <NeverLoseMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
      />

      {/* Buy Menu Modal (B) */}
      <BuyMenuModal
        isOpen={isBuyMenuOpen}
        onClose={() => setIsBuyMenuOpen(false)}
        stats={stats}
        onBuyWeapon={handleBuyWeapon}
        onBuyArmor={handleBuyArmor}
      />

      {/* Scoreboard Modal (Tab) */}
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        stats={stats}
        score={score}
        config={config}
      />

      {/* Tutorial / Intro Banner (Dismissible) */}
      {showTutorial && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-[#090f20]/95 border border-[#00f0ff]/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-md max-w-xl text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#00f0ff] uppercase tracking-wider">
              🎮 CS:GO HvH Simulator • NeverLose.cc v4
            </span>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800 cursor-pointer"
            >
              Close [X]
            </button>
          </div>
          <h1 className="text-xl font-black text-white mb-2">
            Добро пожаловать в CS:GO HvH NeverLose Simulator!
          </h1>
          <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
            Полноценная 3D битва читов (Hack vs Hack). Настройте <strong>Ragebot, Double-Tap, Anti-Aim, Spinbot, Desync, Резольвер</strong> и выберите легендарных агентов CS:GO!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-300 mb-4 text-left">
            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
              <span className="text-[#00f0ff] font-bold block">INSERT</span>
              <span>Меню NeverLose</span>
            </div>
            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
              <span className="text-[#00f0ff] font-bold block">C</span>
              <span>Auto-Peek возврат</span>
            </div>
            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
              <span className="text-[#00f0ff] font-bold block">V</span>
              <span>1st / 3rd Person</span>
            </div>
            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
              <span className="text-[#00f0ff] font-bold block">B / TAB</span>
              <span>Покупка / Таблица</span>
            </div>
          </div>
          <button
            onClick={() => setShowTutorial(false)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,180,216,0.5)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Вступить в бой (Start HvH Battle)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
