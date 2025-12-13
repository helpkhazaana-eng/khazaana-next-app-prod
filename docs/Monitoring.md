# Khazaana Monitoring Strategy

This document outlines the comprehensive monitoring and alerting strategy for the Khazaana platform.

## Architecture Overview

```mermaid
graph TD
    A[Client App] -->|Captures Errors| B[Logger / MonitoringService]
    B -->|Sentry SDK| C[Sentry (Error Tracking)]
    B -->|LogRocket SDK| D[LogRocket (Session Replay)]
    B -->|CRITICAL / ERROR| E[Google Apps Script]
    E -->|Writes Row| F[Google Sheets (SystemLogs)]
    G[Time-Trigger 9PM] -->|Reads 24h Logs| E
    E -->|Sends Email| H[Admin Emails]
```

## 1. Error Tracking (Sentry)
*   **Purpose**: Real-time error capture with stack traces and device context.
*   **Integration**: `@sentry/nextjs`
*   **Scope**: Client-side exceptions, API failures, Server Action errors.

## 2. Session Replay (LogRocket)
*   **Purpose**: Visual replay of what the user did before an error occurred.
*   **Integration**: `logrocket` package.
*   **Privacy**: Inputs (passwords, credit cards) are sanitized/ignored.

## 3. Business Critical Alerts (Google Sheets + Email)
This is our custom backup system to ensure we own our data and get daily digests.

### Data Flow
1.  **Capture**: `MonitoringService.captureError()` is called.
2.  **Filter**: Only `HIGH` or `CRITICAL` severity errors are forwarded to Google Sheets.
3.  **Transport**: `fetch(GOOGLE_SCRIPT_URL, { action: 'logError', ... })`
4.  **Storage**: Saved to `SystemLogs` tab in the Master Sheet.
5.  **Alerting**:
    *   **Real-time**: Apps Script *can* send immediate email for `CRITICAL` events (optional).
    *   **Daily Digest**: Apps Script runs at 9 PM IST, aggregates unique errors, and sends a summary report.

## 4. Performance Monitoring
*   **Core Web Vitals**: LCP, FID, CLS captured by `MonitoringService`.
*   **API Latency**: `fetch` interceptor logs requests taking > 3s.

## 5. Implementation Details

### `src/lib/monitoring.ts`
The core service singleton responsible for initializing SDKs and normalizing error reporting.

### `src/lib/logger.ts`
The developer-facing API. It wraps `MonitoringService` so developers just use `logger.error()`.

### Google Apps Script (`Code.gs`)
Handles the `logError` action:
```javascript
function handleLogError(sheet, data) {
  sheet.appendRow([
    new Date(),
    data.severity,
    data.message,
    JSON.stringify(data.context),
    data.userAgent,
    data.sessionId,
    data.url
  ]);
}
```

## 6. Daily Email Report Format
Subject: `[Khazaana] Daily System Health Report - 12 Dec 2025`

Body:
> **Summary**
> Total Errors: 5
> Critical: 1
>
> **Top Errors:**
> 1. PaymentGatewayTimeout - 3 occurrences
> 2. OrderSubmissionFailed - 2 occurrences
>
> [View Full Logs in Google Sheets]
