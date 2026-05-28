"use client";

import React from 'react';

interface Section {
  key: string;
  label: string;
  icon: string;
}

interface MobileNavProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  sections: Section[];
  activeSection: string;
  setActiveSection: (key: string) => void;
}

export default function MobileNav({ mobileNavOpen, setMobileNavOpen, sections, activeSection, setActiveSection }: MobileNavProps) {
  return (
    <>
      {/* ── Mobile FAB ── */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-surface-container-lowest border-t border-outline-variant">
        {sections.slice(0, 4).map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-full transition-all ${
              activeSection === sec.key
                ? "bg-primary-container text-on-primary-container active:scale-90"
                : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{sec.icon}</span>
            <span className="text-[10px] font-semibold mt-0.5">{sec.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
      {/* ── Mobile Menu Overlay ── */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-surface flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <h2 className="text-title-md font-bold text-primary">Menu</h2>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="p-2 bg-surface-container-highest rounded-full text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.map(sec => (
              <button
                key={sec.key}
                onClick={() => {
                  setActiveSection(sec.key);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                  activeSection === sec.key
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined">{sec.icon}</span>
                <span className="text-body-lg">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
