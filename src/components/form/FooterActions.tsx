"use client";

import React from 'react';

interface Section {
  key: string;
  label: string;
  icon: string;
}

interface FooterActionsProps {
  prevSection: Section | null;
  nextSection: Section | null;
  setActiveSection: (key: string) => void;
  saveDraft: () => void;
  submitForm: () => void;
  loading: boolean;
}

export default function FooterActions({ prevSection, nextSection, setActiveSection, saveDraft, submitForm, loading }: FooterActionsProps) {
  return (
    <footer className="mt-auto bg-surface-container-lowest border-t border-outline-variant px-6 py-4 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => prevSection && setActiveSection(prevSection.key)}
          disabled={!prevSection}
          className="flex items-center gap-2 px-6 py-2 border border-primary text-primary font-semibold rounded hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          Previous Section
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={loading}
            className="px-6 py-2 text-secondary font-semibold hover:bg-surface-container transition-colors rounded text-label-md"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          {nextSection ? (
            <button
              type="button"
              onClick={() => setActiveSection(nextSection.key)}
              className="flex items-center gap-1 px-8 py-2 bg-primary text-on-primary font-semibold rounded shadow hover:opacity-90 active:scale-95 transition-all text-label-md"
            >
              Save &amp; Continue
              <span className="material-symbols-outlined text-[18px] ml-1">chevron_right</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={submitForm}
              disabled={loading}
              className="flex items-center gap-1 px-8 py-2 bg-primary text-on-primary font-semibold rounded shadow hover:opacity-90 active:scale-95 transition-all text-label-md disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
              <span className="material-symbols-outlined text-[18px] ml-1">send</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
