// Lazy load heavy monitoring libraries to reduce initial bundle size
let Sentry: any = null;
let LogRocket: any = null;

const loadSentry = async () => {
  if (!Sentry) {
    Sentry = await import('@sentry/nextjs');
  }
  return Sentry;
};

const loadLogRocket = async () => {
  if (!LogRocket) {
    const module = await import('logrocket');
    LogRocket = module.default;
  }
  return LogRocket;
};

// Configuration
export const MONITORING_CONFIG = {
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  LOGROCKET_APP_ID: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '',
  // Use the same Google Script URL as the rest of the app
  ALERT_WEBHOOK_URL: process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum LogType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action',
  ORDER = 'order',
  PAYMENT = 'payment'
}

class MonitoringService {
  private isInitialized = false;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Defer monitoring initialization to not block main thread
    requestIdleCallback(async () => {
      try {
        // Initialize LogRocket lazily
        if (MONITORING_CONFIG.LOGROCKET_APP_ID) {
          const LR = await loadLogRocket();
          LR?.init(MONITORING_CONFIG.LOGROCKET_APP_ID);
        }

        // Sentry configuration lazily
        try {
          const S = await loadSentry();
          const scope = S?.getCurrentScope();
          scope?.setTag('session_id', this.sessionId);
        } catch (e) {
          // Fallback for older SDK versions if needed, or ignore
        }

        this.isInitialized = true;
        this.setupGlobalErrorHandlers();
        this.setupPerformanceMonitoring();
      } catch (error) {
        console.error('Failed to initialize monitoring:', error);
      }
    }, { timeout: 5000 });
  }

  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandled_rejection'
      });
    });
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Basic performance logging
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        
        this.log(LogType.PERFORMANCE, 'Page Load', {
          pageLoadTime,
          userAgent: navigator.userAgent
        });
      }, 0);
    });
  }

  async captureError(error: Error, context?: Record<string, any>, severity: ErrorSeverity = ErrorSeverity.MEDIUM) {
    if (!this.isInitialized && typeof window !== 'undefined') {
       // Try to init if not already
       this.init();
    }

    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      severity,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: new Date().toISOString()
    };

    // 1. Send to Sentry (lazy loaded)
    const S = await loadSentry();
    S?.withScope((scope: any) => {
      if (context) scope.setExtras(context);
      scope.setLevel(severity as any);
      S.captureException(error);
    });

    // 2. Send to LogRocket (lazy loaded)
    const LR = await loadLogRocket();
    LR?.captureException(error, { extra: context });

    // 3. Send CRITICAL/HIGH errors to Google Sheets via Webhook
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      this.sendToGoogleSheets(errorData);
    }
  }

  async log(type: LogType, message: string, data?: Record<string, any>) {
    // Console output only in dev
    if (process.env.NODE_ENV === 'development') {
      if (type === LogType.ERROR) console.error(`[${type}]`, message, data);
      else if (type === LogType.WARNING) console.warn(`[${type}]`, message, data);
      else console.log(`[${type}]`, message, data);
    }

    // LogRocket (lazy loaded)
    if (typeof window !== 'undefined') {
      const LR = await loadLogRocket();
      LR?.log(message, { type, ...data });
    }

    // Breadcrumbs for Sentry (lazy loaded)
    const S = await loadSentry();
    S?.addBreadcrumb({
      category: type,
      message: message,
      data: data,
      level: type === LogType.ERROR ? 'error' : 'info'
    });
  }

  async identifyUser(userId: string, traits?: Record<string, any>) {
    if (typeof window === 'undefined') return;
    
    const LR = await loadLogRocket();
    LR?.identify(userId, traits);
    const S = await loadSentry();
    S?.setUser({ id: userId, ...traits });
  }

  private async sendToGoogleSheets(data: any) {
    if (!MONITORING_CONFIG.ALERT_WEBHOOK_URL) return;

    try {
      // Use no-cors mode to send data without waiting for response
      await fetch(MONITORING_CONFIG.ALERT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logError',
          log: data
        })
      });
    } catch (e) {
      console.error('Failed to send error to Google Sheets:', e);
    }
  }
}

export const Monitoring = new MonitoringService();
