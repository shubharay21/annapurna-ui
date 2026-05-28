"use client";

import React from 'react';
import { useLanguage } from "@/app/i18n/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <>
      {/* ── Mobile Menu Drawer Backdrop ── */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* ── Mobile Menu Drawer ── */}
      <aside 
        className={`md:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-[70] bg-surface flex flex-col shadow-2xl border-r border-outline-variant transition-transform duration-300 ease-in-out ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_open</span>
            <h2 className="text-label-lg font-bold text-primary">{t("Form Sections")}</h2>
          </div>
          <button 
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="p-2 bg-surface-container-highest rounded-full text-on-surface hover:bg-surface-variant transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Drawer Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-surface-container-lowest">
          {sections.map(sec => {
            const isActive = activeSection === sec.key;
            return (
              <button
                type="button"
                key={sec.key}
                onClick={() => {
                  setActiveSection(sec.key);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-bold scale-[0.98]"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{sec.icon}</span>
                <span className="text-label-md">{t(sec.label)}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low text-center">
          <p className="text-[10px] text-outline">Annapurna Yojana Portal v2.0</p>
        </div>
      </aside>
    </>
  );
}
