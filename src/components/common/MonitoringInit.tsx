'use client';

import { useEffect } from 'react';
import { Monitoring } from '@/lib/monitoring';

export default function MonitoringInit() {
  useEffect(() => {
    // Initialize monitoring service on client mount
    Monitoring.init();
    
    // Log initial page view
    Monitoring.log(
        'info' as any, // utilizing string literal to avoid type enum dependency issues in simple component
        'Application Mounted'
    );
  }, []);

  return null; // This component renders nothing
}
