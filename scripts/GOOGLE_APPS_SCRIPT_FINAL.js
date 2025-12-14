/**
 * ============================================================
 * KHAZAANA BACKEND v2.0 (FINAL)
 * Handles: Orders, Users, Analytics, Monitoring, Invoices
 * ============================================================
 */

// CONFIGURATION
const ADMIN_EMAIL = 'helpkhazaana@gmail.com';
const FOLDER_NAME = 'Khazaana Invoices';
const APP_NAME = 'Khazaana';
const TIMEZONE = 'Asia/Kolkata';

/**
 * MAIN ENTRY POINT (POST REQUESTS)
 */
function doPost(e) {
  try {
    let body;
    if (e.parameter && e.parameter.payload) {
      body = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = body.action;

    // === ROUTING ===
    switch (action) {
      // Core Data
      case 'getDashboardData': return handleGetDashboardData(ss);
      case 'getOrders':        return handleGetOrders(ss, body);
      case 'getUsers':         return handleGetUsers(ss);
      case 'addOrder':         return handleAddOrder(ss, body);
      case 'addOrUpdateUser':  return handleAddUser(ss, body);
      
      // Advanced Features
      case 'getAnalytics':     return handleGetAnalytics(ss);
      case 'triggerInvoice':   return handleTriggerInvoice(ss, body);
      case 'logError':         return handleLogError(ss, body);
      
      // Notifications
      case 'getNotifications':     return handleGetNotifications(ss, body);
      case 'getUserNotifications': return handleGetUserNotifications(ss, body);
      case 'logNotification':      return handleLogNotification(ss, body);
      
      default:
        return handleLegacyOrder(ss, body); // Fallback
    }

  } catch (err) {
    return createJSONOutput({ success: false, error: err.toString() });
  }
}

/**
 * HELPER: JSON OUTPUT
 */
function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 1. DASHBOARD & ORDERS
// ============================================================

function handleGetDashboardData(ss) {
  const ordersSheet = ss.getSheetByName('Orders');
  const usersSheet = ss.getSheetByName('Users');
  
  const ordersData = ordersSheet ? ordersSheet.getDataRange().getValues() : [];
  const usersData = usersSheet ? usersSheet.getDataRange().getValues() : [];
  
  // Indices (0-based)
  // Total_Price is I (8), Order_Status is Q (16)
  
  let totalRevenue = 0;
  let activeOrders = 0;
  
  if (ordersData.length > 1) {
    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      totalRevenue += parseFloat(row[8] || 0);
      
      const status = (row[16] || '').toLowerCase();
      if (['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(status)) {
        activeOrders++;
      }
    }
  }
  
  const totalOrders = Math.max(0, ordersData.length - 1);
  const totalUsers = Math.max(0, usersData.length - 1);
  
  // Get Recent 10 Orders
  const recentOrders = [];
  if (ordersData.length > 1) {
    const count = Math.min(10, ordersData.length - 1);
    for (let i = 0; i < count; i++) {
      const rowIndex = ordersData.length - 1 - i;
      const row = ordersData[rowIndex];
      recentOrders.push({
        orderId: row[0],
        customerName: row[9],
        restaurantName: row[2],
        total: row[8],
        status: row[16],
        date: row[15],
        items: row[3]
      });
    }
  }
  
  return createJSONOutput({
    success: true,
    stats: {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalUsers,
      activeOrders
    },
    recentOrders
  });
}

function handleGetOrders(ss, body) {
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return createJSONOutput({ success: false, error: 'Orders sheet missing' });
  
  const page = body.page || 1;
  const limit = body.limit || 20;
  const statusFilter = body.status;
  const search = (body.search || '').toLowerCase();
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).reverse(); // Newest first
  
  let filtered = rows;
  
  // Filter by Status
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(row => (row[16] || '').toLowerCase() === statusFilter.toLowerCase());
  }
  
  // Filter by Search
  if (search) {
    filtered = filtered.filter(row => 
      String(row[0]).toLowerCase().includes(search) || // ID
      String(row[9]).toLowerCase().includes(search) || // Customer Name
      String(row[2]).toLowerCase().includes(search)    // Restaurant
    );
  }
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const pagedRows = filtered.slice(start, start + limit);
  
  const orders = pagedRows.map(row => ({
    orderId: row[0],
    userId: row[1],
    restaurantName: row[2],
    itemsJson: row[3],
    totalItems: row[4],
    subtotal: row[5],
    taxAmount: row[6],
    deliveryFee: row[7],
    totalPrice: row[8],
    customerName: row[9],
    customerPhone: row[10],
    customerEmail: row[11],
    customerAddress: row[12],
    status: row[16],
    orderTime: row[15],
    invoiceUrl: row[21]
  }));
  
  return createJSONOutput({
    success: true,
    orders,
    pagination: { total, page, pages: Math.ceil(total / limit) }
  });
}

function handleAddOrder(ss, body) {
  const sheet = ss.getSheetByName('Orders');
  const data = body.data;
  
  const row = [
    data.Order_ID,
    data.User_ID,
    data.Restaurant_Name,
    data.Items_JSON,
    data.Total_Items,
    data.Subtotal,
    data.Tax_Amount,
    data.Delivery_Fee,
    data.Total_Price,
    data.Customer_Name,
    data.Customer_Phone,
    data.Customer_Email,
    data.Customer_Address,
    data.Latitude,
    data.Longitude,
    new Date().toISOString(), // Order_Time
    'pending',                // Order_Status
    data.Terms_Accepted,
    data.Terms_Accepted_At,
    '',                       // Admin_Notes
    '',                       // Invoice_Trigger
    '',                       // Invoice_URL
    new Date().toISOString(), // Created_At
    new Date().toISOString()  // Updated_At
  ];
  
  sheet.appendRow(row);
  return createJSONOutput({ success: true, orderId: data.Order_ID });
}

// Fallback for older code
function handleLegacyOrder(ss, body) {
  // Try to determine if it's an order
  if (body.Order_ID || (body.data && body.data.Order_ID)) {
    return handleAddOrder(ss, body.data ? body : { data: body });
  }
  return createJSONOutput({ success: false, error: 'Unknown action' });
}

// ============================================================
// 2. USERS
// ============================================================

function handleAddUser(ss, body) {
  const sheet = ss.getSheetByName('Users');
  const data = body.data;
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let existingRow = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.User_ID) {
      existingRow = i + 1;
      break;
    }
  }
  
  if (existingRow > 0) {
    // Update
    const currentOrders = sheet.getRange(existingRow, 9).getValue() || 0;
    sheet.getRange(existingRow, 9).setValue(currentOrders + 1); 
    sheet.getRange(existingRow, 10).setValue(data.Last_Order_At);
    sheet.getRange(existingRow, 5).setValue(data.Address);
    sheet.getRange(existingRow, 6).setValue(data.Lat);
    sheet.getRange(existingRow, 7).setValue(data.Long);
    if (data.FCM_Token) sheet.getRange(existingRow, 11).setValue(data.FCM_Token);
  } else {
    // Insert
    const row = [
      data.User_ID, data.Name, data.Phone, data.Email || '',
      data.Address, data.Lat, data.Long, data.Created_At,
      data.Total_Orders || 1, data.Last_Order_At, data.FCM_Token || ''
    ];
    sheet.appendRow(row);
  }
  
  return createJSONOutput({ success: true, userId: data.User_ID });
}

function handleGetUsers(ss) {
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues().slice(1);
  
  const users = data.map(row => ({
    userId: row[0],
    name: row[1],
    phone: row[2],
    fcmToken: row[10] || null,
    totalOrders: row[8],
    lastOrderAt: row[9]
  }));
  
  return createJSONOutput({
    success: true,
    totalUsers: users.length,
    validTokens: users.filter(u => u.fcmToken).length,
    users
  });
}

// ============================================================
// 3. MONITORING & LOGGING
// ============================================================

function handleLogError(ss, body) {
  let sheet = ss.getSheetByName('SystemLogs');
  if (!sheet) {
    sheet = ss.insertSheet('SystemLogs');
    sheet.appendRow(['Timestamp', 'Level', 'Message', 'Context', 'User_Agent', 'Session_ID', 'URL']);
  }
  
  const log = body.log;
  const row = [
    new Date().toISOString(),
    log.level,
    log.message,
    JSON.stringify(log.context || {}),
    log.userAgent || '',
    log.sessionId || '',
    log.url || ''
  ];
  
  sheet.appendRow(row);
  
  // If CRITICAL, send immediate email alert
  if (log.level === 'CRITICAL') {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: `🚨 CRITICAL ERROR: ${APP_NAME}`,
      htmlBody: `
        <h2>Critical Error Detected</h2>
        <p><strong>Message:</strong> ${log.message}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: TIMEZONE })}</p>
        <p><strong>Session:</strong> ${log.sessionId}</p>
        <pre>${JSON.stringify(log.context, null, 2)}</pre>
      `
    });
  }
  
  return createJSONOutput({ success: true });
}

// DAILY REPORT TRIGGER (Run this via Time-based Trigger)
function sendDailyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stats = getDailyStats(ss);
  
  const dateStr = new Date().toLocaleDateString('en-IN', { timeZone: TIMEZONE });
  
  const template = HtmlService.createTemplate(`
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #F97316;">Khazaana Daily Report</h1>
      <p>Summary for <strong><?= date ?></strong></p>
      
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <h3>Revenue</h3>
          <p style="font-size: 24px; font-weight: bold;">₹<?= stats.revenue ?></p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <h3>Orders</h3>
          <p style="font-size: 24px; font-weight: bold;"><?= stats.orders ?></p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <h3>New Users</h3>
          <p style="font-size: 24px; font-weight: bold;"><?= stats.newUsers ?></p>
        </div>
      </div>
      
      <h3>Top Items Today</h3>
      <ul>
        <? for (var i = 0; i < stats.topItems.length; i++) { ?>
          <li><?= stats.topItems[i] ?></li>
        <? } ?>
      </ul>
      
      <p style="margin-top: 30px; color: #666;">
        <a href="https://khazaana-admin.vercel.app">Go to Admin Dashboard</a>
      </p>
    </div>
  `);
  
  template.date = dateStr;
  template.stats = stats;
  
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: `Khazaana Daily Summary - ${dateStr}`,
    htmlBody: template.evaluate().getContent()
  });
}

function getDailyStats(ss) {
  const ordersSheet = ss.getSheetByName('Orders');
  const usersSheet = ss.getSheetByName('Users');
  
  const today = new Date();
  // Use specific format options to ensure consistency
  const options = { timeZone: TIMEZONE, year: 'numeric', month: 'numeric', day: 'numeric' };
  const todayStr = today.toLocaleDateString('en-IN', options);
  
  let revenue = 0;
  let ordersCount = 0;
  const itemCounts = {};
  
  // PROCESS ORDERS
  if (ordersSheet) {
    const data = ordersSheet.getDataRange().getValues();
    // Skip header (row 0), start at 1
    for (let i = 1; i < data.length; i++) {
      const rowTime = data[i][15]; // Order_Time
      if (!rowTime) continue;
      
      const rowDate = new Date(rowTime);
      const rowDateStr = rowDate.toLocaleDateString('en-IN', options);
      
      if (rowDateStr === todayStr) {
        ordersCount++;
        revenue += parseFloat(data[i][8] || 0); // Total_Price
        
        // Count Items
        try {
          const items = JSON.parse(data[i][3]); // Items_JSON
          items.forEach(item => {
            const name = item.name || item.title;
            if (name) {
              itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
            }
          });
        } catch (e) {}
      }
    }
  }
  
  // PROCESS USERS
  let newUsers = 0;
  if (usersSheet) {
    const data = usersSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const rowTime = data[i][7]; // Created_At
      if (!rowTime) continue;
      
      const rowDate = new Date(rowTime);
      const rowDateStr = rowDate.toLocaleDateString('en-IN', options);
      
      if (rowDateStr === todayStr) {
        newUsers++;
      }
    }
  }
  
  // GET TOP 3 ITEMS
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1]) // Descending by count
    .slice(0, 3)
    .map(entry => entry[0] + ' (' + entry[1] + ')');
    
  return {
    revenue: Math.round(revenue),
    orders: ordersCount,
    newUsers,
    topItems
  }; 
}

// ============================================================
// 4. ANALYTICS (5 Key Metrics)
// ============================================================

function handleGetAnalytics(ss) {
  let analyticsSheet = ss.getSheetByName('Analytics');
  
  // 1. Try to read cache
  let cachedData = null;
  let cacheAge = 99999999; // Minutes
  
  if (analyticsSheet) {
    const lastRow = analyticsSheet.getLastRow();
    if (lastRow > 1) { // Assuming header row 1
      const range = analyticsSheet.getRange(lastRow, 1, 1, 2);
      const values = range.getValues()[0];
      const timestamp = new Date(values[0]);
      const json = values[1];
      
      if (json && !isNaN(timestamp.getTime())) {
        cacheAge = (new Date().getTime() - timestamp.getTime()) / (1000 * 60);
        try {
          cachedData = JSON.parse(json);
        } catch (e) {
          // Bad JSON in cache
        }
      }
    }
  }

  // 2. Return Cache if Fresh (< 15 mins)
  if (cachedData && cacheAge < 15) {
    return createJSONOutput({
      success: true,
      data: cachedData,
      source: 'cache'
    });
  }

  // 3. Calculate Fresh Data
  try {
    const data = calculateAnalytics(ss);
    
    // 4. Save to Sheet
    if (!analyticsSheet) {
      analyticsSheet = ss.insertSheet('Analytics');
      analyticsSheet.appendRow(['Timestamp', 'Data_JSON']);
    }
    
    analyticsSheet.appendRow([new Date().toISOString(), JSON.stringify(data)]);
    
    return createJSONOutput({
      success: true,
      data: data,
      source: 'fresh'
    });
    
  } catch (e) {
    // 5. Fallback to Stale Cache on Error
    if (cachedData) {
      return createJSONOutput({
        success: true,
        data: cachedData,
        source: 'fallback_cache',
        error: 'Calculation failed, showing cached data. ' + e.toString()
      });
    }
    
    return createJSONOutput({ success: false, error: e.toString() });
  }
}

function calculateAnalytics(ss) {
  const ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) throw new Error('Orders sheet missing');

  const data = ordersSheet.getDataRange().getValues();
  // const headers = data[0]; // unused
  const rows = data.slice(1);
  
  // Columns (0-based from logic inspection)
  // Headers: Order_ID(A), User_ID(B), Restaurant(C), Items(D)... 
  // Phone is K (10), Total is I (8), Time is P (15)
  const C_REST = 2;   // C
  const C_ITEMS = 3;  // D
  const C_TOTAL = 8;  // I
  const C_PHONE = 10; // K
  const C_TIME = 15;  // P
  
  // Metrics Containers
  const dishCounts = {};
  const restaurantCounts = {};
  const userSpend = {};
  const hourCounts = {};
  
  let totalRevenue = 0;
  let validOrders = 0;
  
  const revenueTrend = {}; // YYYY-MM-DD -> value
  
  rows.forEach(row => {
    // 1. Top Items
    try {
      const items = JSON.parse(row[C_ITEMS]);
      items.forEach(item => {
        const name = item.name || item.title;
        if (name) {
            dishCounts[name] = (dishCounts[name] || 0) + (item.quantity || 1);
        }
      });
    } catch (e) {}
    
    // 2. Famous Restaurant
    const rest = row[C_REST];
    if (rest) restaurantCounts[rest] = (restaurantCounts[rest] || 0) + 1;
    
    // 3. Top Users
    const phone = row[C_PHONE];
    const amount = parseFloat(row[C_TOTAL] || 0);
    if (phone) {
      if (!userSpend[phone]) userSpend[phone] = { count: 0, total: 0, name: row[9] };
      userSpend[phone].count++;
      userSpend[phone].total += amount;
    }
    
    // 4. Average Order Value & Trends
    if (amount > 0) {
      totalRevenue += amount;
      validOrders++;
      
      const date = new Date(row[C_TIME]);
      if (!isNaN(date.getTime())) {
         // Revenue Trend
         const key = date.toISOString().split('T')[0];
         revenueTrend[key] = (revenueTrend[key] || 0) + amount;
         
         // 5. Best Time (Hour)
         // Adjust to IST roughly for binning if needed, or just use getHours which is script TZ dependent
         // Apps Script defaults to script timezone (set to India/Kolkata at top)
         const hour = date.getHours(); 
         hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }
  });
  
  // SORTING & FORMATTING
  
  // 1. Most Ordered Dish
  const sortedDishes = Object.entries(dishCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, value: count }));
    
  // 2. Most Famous Restaurant
  const sortedRest = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, value: count }));
    
  // 3. Top Users
  const sortedUsers = Object.entries(userSpend)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([phone, data]) => ({ name: data.name, phone, orders: data.count, totalSpent: data.total }));
    
  // 4. AOV
  const aov = validOrders > 0 ? Math.round(totalRevenue / validOrders) : 0;
  
  // 5. Best Time
  const sortedHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hour, count]) => ({ 
      name: `${hour}:00 - ${parseInt(hour)+1}:00`, 
      value: count 
    }));
    
  // Revenue Trend Array
  const revenueChart = Object.entries(revenueTrend)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30); // Last 30 days
    
  return {
      topDishes: sortedDishes,
      topRestaurants: sortedRest,
      topUsers: sortedUsers,
      averageOrderValue: aov,
      busyHours: sortedHours,
      revenueTrend: revenueChart
  };
}

// ============================================================
// 5. INVOICE GENERATION (PDF)
// ============================================================

function handleTriggerInvoice(ss, body) {
  const orderId = body.orderId;
  const sheet = ss.getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return createJSONOutput({ success: false, error: 'Order not found' });
  
  try {
    const url = generateInvoiceForRow(sheet, rowIndex, data[rowIndex - 1]);
    return createJSONOutput({ success: true, invoiceUrl: url });
  } catch (e) {
    return createJSONOutput({ success: false, error: e.toString() });
  }
}

function generateInvoiceForRow(sheet, rowIndex, rowData) {
  // Parse Data
  const rawItems = JSON.parse(rowData[3]);
  const items = rawItems.map(item => ({
    name: item.name || item.title || 'Item',
    qty: item.qty || item.quantity || 1,
    price: parseFloat(item.price || 0),
    total: (item.qty || item.quantity || 1) * parseFloat(item.price || 0)
  }));

  const order = {
    id: rowData[0],
    date: new Date(rowData[15]).toLocaleString('en-IN', { timeZone: TIMEZONE }),
    customer: {
      name: rowData[9],
      phone: rowData[10],
      email: rowData[11],
      address: rowData[12]
    },
    restaurant: rowData[2],
    items: items,
    totals: {
      subtotal: parseFloat(rowData[5] || 0).toFixed(2),
      tax: parseFloat(rowData[6] || 0).toFixed(2),
      delivery: parseFloat(rowData[7] || 0).toFixed(2),
      total: parseFloat(rowData[8] || 0).toFixed(2)
    }
  };
  
  // HTML Template - Professional & Aesthetic
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', Helvetica, sans-serif; color: #1e293b; padding: 0; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; background: #fff; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
        .brand h1 { margin: 0; color: #F97316; font-size: 28px; letter-spacing: -0.5px; }
        .brand p { margin: 4px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { margin: 0; font-size: 24px; color: #0f172a; }
        .invoice-title p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
        
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px; }
        .info-col h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 0 8px; }
        .info-col p { margin: 0; font-size: 14px; line-height: 1.5; color: #334155; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px 0; border-bottom: 2px solid #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; }
        td { padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
        .text-right { text-align: right; }
        
        .summary { display: flex; justify-content: flex-end; }
        .summary-box { width: 300px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #64748b; }
        .row.total { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 16px; font-weight: 700; color: #0f172a; font-size: 18px; }
        
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">
            <h1>Khazaana</h1>
            <p>Khaana ka Khazaana ab ghar tak</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>#${order.id}</p>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-col">
            <h3>Billed To</h3>
            <p><strong>${order.customer.name}</strong><br>${order.customer.phone}<br>${order.customer.address}</p>
          </div>
          <div class="info-col text-right">
            <h3>Order Details</h3>
            <p><strong>Date:</strong> ${order.date}<br><strong>Restaurant:</strong> ${order.restaurant}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50%">Item</th>
              <th style="width: 15%; text-align: center">Qty</th>
              <th style="width: 15%" class="text-right">Price</th>
              <th style="width: 20%" class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: center">${item.qty}</td>
                <td class="text-right">₹${item.price}</td>
                <td class="text-right">₹${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-box">
            <div class="row"><span>Subtotal</span> <span>₹${order.totals.subtotal}</span></div>
            <div class="row"><span>Tax (GST)</span> <span>₹${order.totals.tax}</span></div>
            <div class="row"><span>Delivery Fee</span> <span>₹${order.totals.delivery}</span></div>
            <div class="row total"><span>Total Paid</span> <span>₹${order.totals.total}</span></div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Khazaana! We hope you enjoy your meal.</p>
          <p>For support/issues: ${ADMIN_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Create PDF
  const blob = Utilities.newBlob(html, MimeType.HTML).getAs(MimeType.PDF);
  blob.setName(`Invoice_${order.id}.pdf`);
  
  // Save to Folder
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(FOLDER_NAME);
  }
  
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileUrl = file.getUrl();
  
  // Update Sheet with URL
  sheet.getRange(rowIndex, 22).setValue(fileUrl);
  
  // EMAIL TO CUSTOMER (If email exists)
  if (order.customer.email && order.customer.email.includes('@')) {
    try {
      MailApp.sendEmail({
        to: order.customer.email,
        subject: `Your Khazaana Invoice - Order #${order.id}`,
        htmlBody: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #F97316;">Order Confirmation</h2>
            <p>Hi ${order.customer.name},</p>
            <p>Thank you for your order from <strong>${order.restaurant}</strong>.</p>
            <p>We've attached your invoice for reference.</p>
            <br>
            <p><strong>Order Total:</strong> ₹${order.totals.total}</p>
            <br>
            <p>Enjoy your meal!<br>Team Khazaana</p>
          </div>
        `,
        attachments: [blob]
      });
    } catch (err) {
      // Log email failure but don't fail the whole process
      Logger.log('Failed to send email: ' + err.toString());
    }
  }
  
  return fileUrl;
}

// ============================================================
// 6. NOTIFICATIONS
// ============================================================

function handleLogNotification(ss, body) {
  let sheet = ss.getSheetByName('Notifications');
  if (!sheet) {
    sheet = ss.insertSheet('Notifications');
    sheet.appendRow(['ID', 'Timestamp', 'Title', 'Body', 'Target', 'Target_ID', 'Status', 'Sent_By', 'Success_Count', 'Failure_Count', 'Error']);
  }

  const data = body.data;
  const id = 'NOT-' + new Date().getTime();
  
  sheet.appendRow([
    id,
    data.sentAt,
    data.title,
    data.body,
    data.target,
    data.targetId || '',
    data.status,
    data.sentBy,
    data.successCount || 0,
    data.failureCount || 0,
    data.error || ''
  ]);

  return createJSONOutput({ success: true, id: id });
}

function handleGetNotifications(ss, body) {
  const sheet = ss.getSheetByName('Notifications');
  if (!sheet) return createJSONOutput({ success: true, notifications: [] }); // Empty if no sheet

  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).reverse(); // Newest first

  const page = body.page || 1;
  const limit = body.limit || 20;
  
  const start = (page - 1) * limit;
  const pagedRows = rows.slice(start, start + limit);

  const notifications = pagedRows.map(row => ({
    id: row[0],
    sentAt: row[1],
    title: row[2],
    body: row[3],
    target: row[4],
    targetId: row[5],
    status: row[6],
    sentBy: row[7],
    successCount: row[8],
    failureCount: row[9],
    error: row[10]
  }));

  return createJSONOutput({
    success: true,
    notifications,
    pagination: {
      total: rows.length,
      page,
      pages: Math.ceil(rows.length / limit)
    }
  });
}

function handleGetUserNotifications(ss, body) {
  const sheet = ss.getSheetByName('Notifications');
  if (!sheet) return createJSONOutput({ success: true, notifications: [] });

  const userId = body.userId;
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).reverse();
  
  const userNotifs = rows.filter(row => {
    const target = row[4];
    const targetId = row[5];
    
    if (target === 'all') return true;
    if (target === 'user' && targetId === userId) return true;
    return false;
  });

  const limit = body.limit || 50;
  const limited = userNotifs.slice(0, limit);

  const notifications = limited.map(row => ({
    id: row[0],
    sentAt: row[1],
    title: row[2],
    body: row[3],
    status: row[6]
  }));

  return createJSONOutput({
    success: true,
    notifications
  });
}
