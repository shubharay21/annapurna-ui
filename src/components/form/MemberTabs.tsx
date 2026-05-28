"use client";

import React from 'react';

interface Member {
  isHoF: boolean;
  isChild: boolean | null;
  memberName: string;
  [key: string]: unknown;
}

interface MemberTabsProps {
  members: Member[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  isCommonTab: boolean;
}

export default function MemberTabs({ members, activeTab, setActiveTab, isCommonTab }: MemberTabsProps) {
  return (
    <div className="sticky top-14 z-30 bg-surface border-b border-outline-variant">
      <div className="max-w-5xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: "none" }}>
        {members.map((m, i) => {
          const isActive = activeTab === i && !isCommonTab;
          return (
            <button
              type="button"
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex flex-col min-w-[160px] max-w-[220px] p-3 rounded-2xl border transition-all text-left relative shrink-0 ${isActive
                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                : "border-outline-variant bg-white hover:bg-surface-container-lowest hover:border-outline"
                }`}
            >
              <div className="flex items-center gap-2 mb-1.5 w-full">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
                  }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {m.isChild ? 'child_care' : (m.isHoF ? 'shield_person' : 'person')}
                  </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className={`font-bold text-xs truncate ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                    {m.isHoF ? "Head of Family" : `Member ${i + 1}`}
                  </span>
                  <span className={`text-sm font-semibold truncate ${isActive ? "text-on-surface" : "text-secondary"}`}>
                    {m.memberName || "No Name"}
                  </span>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-outline-variant/30 w-full">
                {m.isChild && (
                  <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px]">child_care</span> Child
                  </div>
                )}
                {m.applyingForAnnapurnaBhandar === true && (
                  <div className="flex items-center gap-0.5 bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span> Ananpurna Yojana
                  </div>
                )}
                {m.applyingForAnnapurnaBhandar === false && (
                  <div className="flex items-center gap-0.5 bg-red-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[12px]">cancel</span> Ananpurna Yojana
                  </div>
                )}
                {!m.isChild && m.applyingForAnnapurnaBhandar === undefined && (
                  <div className="h-4"></div> // Spacer to keep height consistent if no badges
                )}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveTab(members.length)}
          className={`flex flex-col min-w-[140px] p-3 rounded-2xl border transition-all justify-center items-center shrink-0 ${isCommonTab
            ? "border-secondary bg-secondary/10 shadow-sm ring-1 ring-secondary/20"
            : "border-outline-variant bg-surface-container hover:bg-surface-variant"
            }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isCommonTab ? "bg-secondary text-on-secondary shadow-md" : "bg-surface-variant text-on-surface-variant"
            }`}>
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
          </div>
          <span className={`font-bold text-sm ${isCommonTab ? "text-secondary" : "text-on-surface-variant"}`}>
            Declaration & Consent
          </span>
        </button>
      </div>
    </div>
  );
}
