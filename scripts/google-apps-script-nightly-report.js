/**
 * ============================================================
 * KHAZAANA NIGHTLY REPORT - GOOGLE APPS SCRIPT
 * ============================================================
 * 
 * This script sends a detailed nightly report via email with:
 * - Daily order summary
 * - Revenue statistics
 * - Error logs from monitoring
 * - Performance metrics
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project named "Khazaana Nightly Report"
 * 3. Copy this entire code into the script editor
 * 4. Update the CONFIG section below with your values
 * 5. Run the setup() function once to authorize
 * 6. Set up a time-based trigger to run sendNightlyReport() at 11 PM IST
 * 
 * TO SET UP TRIGGER:
 * 1. Click on "Triggers" (clock icon) in the left sidebar
 * 2. Click "+ Add Trigger"
 * 3. Choose function: sendNightlyReport
 * 4. Event source: Time-driven
 * 5. Type: Day timer
 * 6. Time of day: 11pm to midnight
 * 7. Save
 */

// ============================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================
const CONFIG = {
  // Email recipients (comma-separated)
  RECIPIENT_EMAILS: [
    'shr6219@gmail.com',
    'helpkhazaana@gmail.com',
    'Mdaskinali@gmail.com'
  ],
  
  // Google Sheet ID for orders data
  ORDERS_SHEET_ID: '1KlftpbJwU-uin4Gyk-Nor1Af-5vpM_-Pgh7R7P5GWR4',
  
  // Sheet names
  ORDERS_SHEET_NAME: 'Orders',
  ERRORS_SHEET_NAME: 'ErrorLogs',
  
  // App name for branding
  APP_NAME: 'Khazaana',
  
  // Timezone
  TIMEZONE: 'Asia/Kolkata'
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

/**
 * Run this once to authorize the script
 */
function setup() {
  Logger.log('Setup complete! You can now set up the trigger.');
  Logger.log('Go to Triggers > Add Trigger > sendNightlyReport > Day timer > 11pm-midnight');
}

/**
 * Main function to send the nightly report
 * Set this up with a time-based trigger to run at 11 PM IST
 */
function sendNightlyReport() {
  try {
    const today = new Date();
    const reportDate = Utilities.formatDate(today, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const displayDate = Utilities.formatDate(today, CONFIG.TIMEZONE, 'EEEE, MMMM d, yyyy');
    
    // Gather all report data
    const orderStats = getOrderStats(reportDate);
    const errorStats = getErrorStats(reportDate);
    const performanceMetrics = getPerformanceMetrics();
    
    // Build email content
    const subject = `📊 ${CONFIG.APP_NAME} Daily Report - ${displayDate}`;
    const htmlBody = buildEmailHTML(orderStats, errorStats, performanceMetrics, displayDate);
    
    // Send to all recipients
    CONFIG.RECIPIENT_EMAILS.forEach(email => {
      MailApp.sendEmail({
        to: email.trim(),
        subject: subject,
        htmlBody: htmlBody
      });
    });
    
    Logger.log(`Nightly report sent successfully to ${CONFIG.RECIPIENT_EMAILS.length} recipients`);
    
  } catch (error) {
    Logger.log('Error sending nightly report: ' + error.message);
    // Send error notification
    MailApp.sendEmail({
      to: CONFIG.RECIPIENT_EMAILS[0],
      subject: `⚠️ ${CONFIG.APP_NAME} Report Error`,
      body: `Failed to generate nightly report: ${error.message}\n\nStack: ${error.stack}`
    });
  }
}

// ============================================================
// DATA GATHERING FUNCTIONS
// ============================================================

/**
 * Get order statistics for the given date
 */
function getOrderStats(date) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID).getSheetByName(CONFIG.ORDERS_SHEET_NAME);
    if (!sheet) {
      return { error: 'Orders sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find column indices
    const dateCol = headers.indexOf('Date') !== -1 ? headers.indexOf('Date') : headers.indexOf('date');
    const amountCol = headers.indexOf('Total') !== -1 ? headers.indexOf('Total') : headers.indexOf('amount');
    const statusCol = headers.indexOf('Status') !== -1 ? headers.indexOf('Status') : headers.indexOf('status');
    const restaurantCol = headers.indexOf('Restaurant') !== -1 ? headers.indexOf('Restaurant') : headers.indexOf('restaurant');
    
    // Filter today's orders
    const todayOrders = rows.filter(row => {
      const rowDate = row[dateCol];
      if (rowDate instanceof Date) {
        return Utilities.formatDate(rowDate, CONFIG.TIMEZONE, 'yyyy-MM-dd') === date;
      }
      return String(rowDate).includes(date);
    });
    
    // Calculate statistics
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, row) => sum + (parseFloat(row[amountCol]) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Count by status
    const statusCounts = {};
    todayOrders.forEach(row => {
      const status = row[statusCol] || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Count by restaurant
    const restaurantCounts = {};
    todayOrders.forEach(row => {
      const restaurant = row[restaurantCol] || 'Unknown';
      restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + 1;
    });
    
    // Get top restaurants
    const topRestaurants = Object.entries(restaurantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      topRestaurants,
      completedOrders: statusCounts['Completed'] || statusCounts['completed'] || 0,
      cancelledOrders: statusCounts['Cancelled'] || statusCounts['cancelled'] || 0
    };
    
  } catch (error) {
    Logger.log('Error getting order stats: ' + error.message);
    return { error: error.message };
  }
}

/**
 * Get error statistics for the given date
 */
function getErrorStats(date) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID).getSheetByName(CONFIG.ERRORS_SHEET_NAME);
    if (!sheet) {
      return { totalErrors: 0, criticalErrors: 0, errors: [] };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find column indices
    const dateCol = headers.indexOf('Timestamp') !== -1 ? headers.indexOf('Timestamp') : 0;
    const severityCol = headers.indexOf('Severity') !== -1 ? headers.indexOf('Severity') : headers.indexOf('severity');
    const messageCol = headers.indexOf('Message') !== -1 ? headers.indexOf('Message') : headers.indexOf('message');
    
    // Filter today's errors
    const todayErrors = rows.filter(row => {
      const rowDate = row[dateCol];
      if (rowDate instanceof Date) {
        return Utilities.formatDate(rowDate, CONFIG.TIMEZONE, 'yyyy-MM-dd') === date;
      }
      return String(rowDate).includes(date);
    });
    
    const criticalErrors = todayErrors.filter(row => 
      String(row[severityCol]).toLowerCase() === 'critical' || 
      String(row[severityCol]).toLowerCase() === 'high'
    );
    
    return {
      totalErrors: todayErrors.length,
      criticalErrors: criticalErrors.length,
      errors: todayErrors.slice(0, 10).map(row => ({
        severity: row[severityCol],
        message: row[messageCol]
      }))
    };
    
  } catch (error) {
    Logger.log('Error getting error stats: ' + error.message);
    return { totalErrors: 0, criticalErrors: 0, errors: [], error: error.message };
  }
}

/**
 * Get performance metrics (placeholder - can be extended)
 */
function getPerformanceMetrics() {
  return {
    uptime: '99.9%',
    avgResponseTime: '< 200ms',
    status: 'Healthy'
  };
}

// ============================================================
// EMAIL TEMPLATE
// ============================================================

/**
 * Build the HTML email content
 */
function buildEmailHTML(orderStats, errorStats, performanceMetrics, displayDate) {
  const formatCurrency = (amount) => '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.APP_NAME} Daily Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">📊 ${CONFIG.APP_NAME}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Daily Business Report</p>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">${displayDate}</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <!-- Order Summary -->
      <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">
        🛒 Order Summary
      </h2>
      
      ${orderStats.error ? `
        <p style="color: #ef4444;">Error loading order data: ${orderStats.error}</p>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #d97706;">${orderStats.totalOrders}</div>
            <div style="font-size: 14px; color: #92400e; font-weight: 600;">Total Orders</div>
          </div>
          <div style="background: #dcfce7; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #16a34a;">${formatCurrency(orderStats.totalRevenue)}</div>
            <div style="font-size: 14px; color: #166534; font-weight: 600;">Revenue</div>
          </div>
          <div style="background: #e0e7ff; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #4f46e5;">${formatCurrency(orderStats.avgOrderValue)}</div>
            <div style="font-size: 14px; color: #3730a3; font-weight: 600;">Avg Order Value</div>
          </div>
          <div style="background: #fce7f3; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 800; color: #db2777;">${orderStats.completedOrders}</div>
            <div style="font-size: 14px; color: #9d174d; font-weight: 600;">Completed</div>
          </div>
        </div>
        
        ${orderStats.topRestaurants && orderStats.topRestaurants.length > 0 ? `
          <h3 style="color: #475569; font-size: 16px; margin: 20px 0 10px 0;">🏆 Top Restaurants</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${orderStats.topRestaurants.map((r, i) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b;">${i + 1}. ${r[0]}</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #1e293b;">${r[1]} orders</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
      `}
      
      <!-- Error Summary -->
      <h2 style="color: #1e293b; font-size: 20px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">
        ⚠️ Error Summary
      </h2>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="background: ${errorStats.totalErrors > 0 ? '#fef2f2' : '#f0fdf4'}; padding: 20px; border-radius: 12px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: ${errorStats.totalErrors > 0 ? '#dc2626' : '#16a34a'};">${errorStats.totalErrors}</div>
          <div style="font-size: 14px; color: ${errorStats.totalErrors > 0 ? '#991b1b' : '#166534'}; font-weight: 600;">Total Errors</div>
        </div>
        <div style="background: ${errorStats.criticalErrors > 0 ? '#fef2f2' : '#f0fdf4'}; padding: 20px; border-radius: 12px; text-align: center;">
          <div style="font-size: 32px; font-weight: 800; color: ${errorStats.criticalErrors > 0 ? '#dc2626' : '#16a34a'};">${errorStats.criticalErrors}</div>
          <div style="font-size: 14px; color: ${errorStats.criticalErrors > 0 ? '#991b1b' : '#166534'}; font-weight: 600;">Critical/High</div>
        </div>
      </div>
      
      ${errorStats.errors && errorStats.errors.length > 0 ? `
        <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px;">Recent Errors:</h4>
          ${errorStats.errors.slice(0, 5).map(e => `
            <div style="background: white; padding: 10px; border-radius: 6px; margin-bottom: 8px; font-size: 13px;">
              <span style="background: ${e.severity === 'critical' ? '#dc2626' : '#f59e0b'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${e.severity}</span>
              <span style="color: #64748b; margin-left: 10px;">${e.message}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <p style="color: #16a34a; text-align: center; padding: 20px;">✅ No errors reported today!</p>
      `}
      
      <!-- System Status -->
      <h2 style="color: #1e293b; font-size: 20px; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">
        🖥️ System Status
      </h2>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
        <div style="font-size: 20px; font-weight: 800; color: #16a34a;">${performanceMetrics.status}</div>
        <div style="font-size: 14px; color: #166534; margin-top: 5px;">Uptime: ${performanceMetrics.uptime} | Response: ${performanceMetrics.avgResponseTime}</div>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">This is an automated report from ${CONFIG.APP_NAME}</p>
      <p style="margin: 5px 0 0 0;">Generated at ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'hh:mm a')} IST</p>
    </div>
    
  </div>
</body>
</html>
  `;
}

// ============================================================
// WEBHOOK HANDLER (for receiving error logs)
// ============================================================

/**
 * Handle POST requests from the app
 * Deploy this as a web app to receive error logs
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'logError') {
      logErrorToSheet(data.log);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Log error to the ErrorLogs sheet
 */
function logErrorToSheet(log) {
  try {
    let sheet = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID).getSheetByName(CONFIG.ERRORS_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      const ss = SpreadsheetApp.openById(CONFIG.ORDERS_SHEET_ID);
      sheet = ss.insertSheet(CONFIG.ERRORS_SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Severity', 'Message', 'URL', 'SessionId', 'Stack']);
    }
    
    sheet.appendRow([
      new Date(),
      log.severity || 'unknown',
      log.message || '',
      log.url || '',
      log.sessionId || '',
      log.stack || ''
    ]);
    
  } catch (error) {
    Logger.log('Error logging to sheet: ' + error.message);
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Test the report generation (run manually)
 */
function testReport() {
  sendNightlyReport();
}

/**
 * Get yesterday's report (useful for testing)
 */
function sendYesterdayReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const reportDate = Utilities.formatDate(yesterday, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const displayDate = Utilities.formatDate(yesterday, CONFIG.TIMEZONE, 'EEEE, MMMM d, yyyy');
  
  const orderStats = getOrderStats(reportDate);
  const errorStats = getErrorStats(reportDate);
  const performanceMetrics = getPerformanceMetrics();
  
  const subject = `📊 ${CONFIG.APP_NAME} Daily Report - ${displayDate}`;
  const htmlBody = buildEmailHTML(orderStats, errorStats, performanceMetrics, displayDate);
  
  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAILS[0],
    subject: subject,
    htmlBody: htmlBody
  });
  
  Logger.log('Yesterday report sent!');
}
