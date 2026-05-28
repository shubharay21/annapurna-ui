"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useMasterData } from "@/hooks/useMasterData";
import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (ifsc: string) => void;
  className?: string;
  placeholder?: string;
}

export default function IfscSearch({ value, onChange, className, placeholder }: Props) {
  const { data: bankData, loading } = useMasterData("bank-ifsc-master.json");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!bankData || !Array.isArray(bankData)) return [];
    if (!value || value.length < 3) return [];
    
    // If it's exactly 11 chars and we found it, don't show the dropdown if it exactly matches the only result
    const lowerSearch = value.toLowerCase();
    const filtered = bankData.filter((b: { ifsc: string; bankName: string; branchName?: string }) => 
      b.ifsc.toLowerCase().includes(lowerSearch) || 
      b.branchName?.toLowerCase().includes(lowerSearch) || 
      b.bankName?.toLowerCase().includes(lowerSearch)
    );
    
    // Limit to 50 for performance
    return filtered.slice(0, 50);
  }, [value, bankData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const selected = results[focusedIndex];
      if (selected) {
        onChange(selected.ifsc);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const exactMatch = value.length === 11 && results.length === 1 && results[0].ifsc === value.toUpperCase();

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className={`${className} pr-10`}
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => {
            if (value.length >= 3) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search Bank, Branch or IFSC"}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/60">
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>
      
      {isOpen && results.length > 0 && !exactMatch && (
        <ul className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-white border border-outline-variant rounded-md shadow-lg py-1">
          {results.map((bank: { ifsc: string; bankName: string; branchName?: string }, i: number) => (
            <li
              key={bank.ifsc}
              className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                focusedIndex === i ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface"
              }`}
              onClick={() => {
                onChange(bank.ifsc);
                setIsOpen(false);
                setFocusedIndex(-1);
              }}
              onMouseEnter={() => setFocusedIndex(i)}
            >
              <div className="font-semibold">{bank.ifsc}</div>
              <div className="text-xs text-secondary truncate">{bank.bankName} - {bank.branchName}</div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && value.length >= 3 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-outline-variant rounded-md shadow-lg py-3 px-4 text-sm text-secondary text-center">
          No matches found
        </div>
      )}
    </div>
  );
}
