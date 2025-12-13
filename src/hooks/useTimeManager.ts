'use client';

import { useState, useEffect } from 'react';
import TimeManager, { type TimeData, TimeUtils } from '@/lib/timeManager';

export function useTimeManager() {
  const [timeData, setTimeData] = useState<TimeData | null>(null);

  useEffect(() => {
    // Initialize if needed
    TimeManager.init();

    // Generate unique ID for listener
    const listenerId = `hook-${Math.random().toString(36).substr(2, 9)}`;

    // Add listener
    TimeManager.addListener(listenerId, (data) => {
      setTimeData(data);
    });

    // Cleanup
    return () => {
      TimeManager.removeListener(listenerId);
    };
  }, []);

  // Return current data or initial synchronous calculation if not yet hydrated from listener
  return timeData || TimeUtils.getCurrentTimeData();
}
