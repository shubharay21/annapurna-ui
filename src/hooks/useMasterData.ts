"use client";

import { useState, useEffect } from 'react';

let versionsCache: Record<string, string> | null = null;
const dataCache: Record<string, any> = {};

export function useMasterData<T = any>(filename: string): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(dataCache[filename] || null);
  const [loading, setLoading] = useState<boolean>(!dataCache[filename]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (dataCache[filename]) {
        if (isMounted) {
          setData(dataCache[filename]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        // Load versions if not loaded
        if (!versionsCache) {
          const vRes = await fetch('/master_data/versions.json');
          if (!vRes.ok) throw new Error('Failed to load versions');
          versionsCache = await vRes.json();
        }

        const version = versionsCache ? versionsCache[filename] || Date.now() : Date.now();
        const res = await fetch(`/master_data/${filename}?v=${version}`);
        
        if (!res.ok) throw new Error(`Failed to load ${filename}`);
        
        const json = await res.json();
        dataCache[filename] = json;

        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filename]);

  return { data, loading, error };
}
