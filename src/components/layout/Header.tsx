"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface HeaderProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  appId?: string | null;
}

// parseJwt is no longer needed since tokens are HttpOnly

function formatTime(seconds: number) {
  if (seconds <= 0) return "00:00";
  // If time is large (e.g. 7 days), just show hours/mins, or simply "Days: HH:MM"
  if (seconds > 86400) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${d}d ${h}h`;
  }
  if (seconds > 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Header({ mobileNavOpen, setMobileNavOpen, appId }: HeaderProps) {
  // Use null as initial state so SSR always renders null (no timers)
  // After mount, state becomes numbers → React reconciles cleanly
  const [tokenTime, setTokenTime] = useState<number | null>(null);
  const [refreshTime, setRefreshTime] = useState<number | null>(null);

  useEffect(() => {
    function updateTimers() {
      const tokenExp = Cookies.get('annapurna_token_exp');
      const refreshExp = Cookies.get('annapurna_refresh_exp');
      const now = Math.floor(Date.now() / 1000);

      if (tokenExp) {
        const exp = parseInt(tokenExp, 10);
        setTokenTime(Math.max(0, exp - now));
      } else {
        setTokenTime(0);
      }

      if (refreshExp) {
        const exp = parseInt(refreshExp, 10);
        setRefreshTime(Math.max(0, exp - now));
      } else {
        setRefreshTime(0);
      }
    }

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await api.logout();
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 h-14 bg-surface border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="material-symbols-outlined text-primary md:!hidden"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          menu
        </button>
        <h1 className="text-headline-sm font-bold text-on-surface">Family Data Collection</h1>
      </div>
      <div className="flex items-center gap-6">
        {appId && (
          <div className="hidden md:flex gap-2 items-center bg-primary/10 text-primary px-3 py-1.5 rounded-md font-mono text-xs border border-primary/20 shadow-sm" title="Application ID">
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            ID: {appId}
          </div>
        )}
        {/* Timers are null on SSR and become numbers after mount — no hydration mismatch */}
        {tokenTime !== null && (
          <div className="flex gap-2 items-center">
            {tokenTime > 0 && (
              <div className="font-mono text-sm px-2 py-0.5 bg-[#dcfce7] text-[#15803d] rounded border border-[#86efac]">
                {formatTime(tokenTime)}
              </div>
            )}
            {refreshTime !== null && refreshTime > 0 && (
              <div className="font-mono text-sm px-2 py-0.5 bg-[#fef08a] text-[#a16207] rounded border border-[#fde047]">
                {formatTime(refreshTime)}
              </div>
            )}
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
          <span className="material-symbols-outlined text-primary text-[18px]">sync</span>
          <span className="text-label-sm text-secondary">Data Synchronized</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_circle</span>
          <span className="hidden md:inline text-label-md text-on-surface-variant">Citizen Portal</span>
        </div>
        <button type="button" onClick={handleLogout} className="flex items-center justify-center p-1.5 rounded-full hover:bg-error-container text-error transition-colors" title="Logout">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
