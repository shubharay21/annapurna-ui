"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/i18n/LanguageContext";

interface Section {
  key: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (key: string) => void;
}

export default function Sidebar({ sections, activeSection, setActiveSection }: SidebarProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 z-50 flex-col bg-surface border-r border-outline-variant shadow-sm hidden md:flex">
      {/* Sidebar Header */}
      <div className="px-6 py-6 flex flex-col gap-2 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          </div>
          <div>
            <p className="text-label-md font-bold text-primary">{t("Data Collector")}</p>
            <p className="text-caption text-on-surface-variant">{t("Annapurna Yojana")}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/30">
          <p className="text-caption text-outline">{t("PORTAL VERSION v2.0")}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sections.filter(sec => sec.key !== "declaration").map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`w-full flex items-center gap-4 px-5 py-3 rounded-full transition-all text-left ${
              activeSection === sec.key
                ? "bg-secondary-container text-on-secondary-container font-bold scale-95"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{sec.icon}</span>
            <span className="text-label-md">{t(sec.label)}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Footer (Language Selector) */}
      <div className="p-4 border-t border-outline-variant flex items-center justify-between">
        <span className="flex items-center gap-2 text-label-md text-on-surface-variant font-medium">
          <span className="material-symbols-outlined text-[20px]">language</span>
          {t("language")}
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "bn")}
          className="bg-surface-container hover:bg-surface-container-high outline-none cursor-pointer rounded-md px-2 py-1.5 text-body-md text-on-surface font-medium border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>
    </aside>
  );
}
