/**
 * Google Sheets Backend Integration
 * Connects to Google Apps Script Web App to store orders
 */

import { logger } from './logger';

// Google Apps Script Web App URL - Env var preferred, fallback to hardcoded for now
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxCWeJy1Ki9G-xXMF7ZJWCcP4ie7GMQKiTBYg4ljxLwGRwVXERn9FBWkHa8KqXbWANi_w/exec';

// Khazaana WhatsApp number for checkout (production)
export const KHAZAANA_WHATSAPP = '918695902696';

// Request timeout (10 seconds - reduced from 30 to prevent long hangs)
const REQUEST_TIMEOUT = 10000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper for fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ============================================
// ADMIN DATA FETCHING TYPES
// ============================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  activeOrders: number;
}

export interface AdminOrder {
  orderId: string;
  userId: string;
  restaurantName: string;
  itemsJson: string;
  totalItems: number;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  status: string;
  orderTime: string;
  invoiceUrl: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: AdminOrder[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  error?: string;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentOrders: any[];
  error?: string;
}

// ============================================
// ADMIN FETCH FUNCTIONS
// ============================================

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  invoiceUrl?: string;
  error?: string;
}

export interface AdminUser {
  userId: string;
  name: string;
  phone: string;
  fcmToken: string | null;
  totalOrders: number;
  lastOrderAt: string;
}

export interface UsersResponse {
  success: boolean;
  totalUsers: number;
  validTokens: number;
  users: AdminUser[];
  error?: string;
}

/**
 * Fetch Users with FCM Tokens
 * Server-side only
 */
export async function getAdminUsers(): Promise<UsersResponse> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getUsers' }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as UsersResponse;
    return data;
  } catch (error) {
    logger.error('Failed to fetch users', error as Error, 'GOOGLE_SHEETS');
    return { success: false, totalUsers: 0, validTokens: 0, users: [], error: 'Network error' };
  }
}

/**
 * Trigger Invoice Generation
 * Server-side only
 */
export async function triggerInvoice(orderId: string): Promise<InvoiceResponse> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'triggerInvoice',
        orderId
      }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as InvoiceResponse;
    return data;
  } catch (error) {
    logger.error('Failed to trigger invoice', error as Error, 'GOOGLE_SHEETS');
    return { success: false, error: 'Network error' };
  }
}

/**
 * Fetch Dashboard Stats
 * Server-side only
 */
export async function getDashboardData(): Promise<DashboardStats | null> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getDashboardData' }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as DashboardResponse;
    if (data.success) {
      return data.stats;
    }
    return null;
  } catch (error) {
    logger.error('Failed to fetch dashboard data', error as Error, 'GOOGLE_SHEETS');
    return null;
  }
}

/**
 * Fetch Orders with Pagination and Search
 * Server-side only
 */
export async function getAdminOrders(
  page: number = 1, 
  limit: number = 20, 
  status: string = 'all', 
  search: string = ''
): Promise<OrdersResponse> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getOrders',
        page,
        limit,
        status,
        search
      }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as OrdersResponse;
    return data;
  } catch (error) {
    logger.error('Failed to fetch orders', error as Error, 'GOOGLE_SHEETS');
    return { success: false, orders: [], pagination: { total: 0, page: 1, pages: 0 }, error: 'Network error' };
  }
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  target: 'all' | 'user' | 'topic';
  targetId?: string; // userId or topic name
  status: 'sent' | 'failed';
  sentAt: string;
  sentBy: string;
  successCount?: number;
  failureCount?: number;
  error?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationLog[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
  error?: string;
}

/**
 * Fetch Notifications History (Admin)
 * Server-side only
 */
export async function getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getNotifications',
        page,
        limit
      }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as NotificationsResponse;
    return data;
  } catch (error) {
    logger.error('Failed to fetch notifications', error as Error, 'GOOGLE_SHEETS');
    return { success: false, notifications: [], error: 'Network error' };
  }
}

/**
 * Fetch User Notifications (History)
 * Server-side only
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<NotificationsResponse> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'getUserNotifications',
        userId,
        limit
      }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as NotificationsResponse;
    return data;
  } catch (error) {
    logger.error('Failed to fetch user notifications', error as Error, 'GOOGLE_SHEETS');
    return { success: false, notifications: [], error: 'Network error' };
  }
}

/**
 * Log Notification to Google Sheets
 * Server-side only
 */
export async function logNotification(notification: Omit<NotificationLog, 'id'>): Promise<{ success: boolean; id?: string }> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'logNotification',
        data: notification
      }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Failed to log notification', error as Error, 'GOOGLE_SHEETS');
    return { success: false };
  }
}

export interface AnalyticsMetrics {
  totalRevenue: string;
  totalOrders: number;
  averageOrderValue: string;
}

export interface AnalyticsChartData {
  date: string;
  amount: number;
}

export interface AnalyticsTopItem {
  name: string;
  count: number;
}

export interface AnalyticsPeakTime {
  hour: string;
  count: number;
}

export interface AnalyticsUser {
  phone: string;
  name: string;
  count: number;
  spend: number;
}

export interface AnalyticsResponse {
  success: boolean;
  metrics: AnalyticsMetrics;
  topDishes: AnalyticsTopItem[];
  topRestaurants: AnalyticsTopItem[];
  topUsers: AnalyticsUser[];
  peakTimes: AnalyticsPeakTime[];
  revenueChart: AnalyticsChartData[];
  error?: string;
}

/**
 * Fetch Analytics Data
 * Server-side only
 */
export async function getAnalyticsData(): Promise<AnalyticsResponse | null> {
  try {
    const response = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAnalytics' }),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json() as AnalyticsResponse;
    return data;
  } catch (error) {
    logger.error('Failed to fetch analytics data', error as Error, 'GOOGLE_SHEETS');
    return null;
  }
}

// ============================================
// EXISTING UTILITIES
// ============================================

/**
 * Generate unique Order ID
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${date}-${random}`;
}

/**
 * Generate unique User ID from phone number
 * Format: USR-PHONE
 */
export function generateUserId(phone: string): string {
  return `USR-${phone}`;
}

/**
 * Format date for Google Sheets in IST with AM/PM
 * Format: YYYY-MM-DD H:MM AM/PM
 */
export function formatDateForSheets(date: Date = new Date()): string {
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  
  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
}

/**
 * Send order to Google Sheets using form submission
 * This bypasses CORS by using a hidden form + iframe
 */
export async function sendOrderToGoogleSheet(orderData: GoogleSheetOrderPayload): Promise<GoogleSheetResponse> {
  if (typeof document === 'undefined') {
    return { success: false, message: 'Client-side only' };
  }

  try {
    logger.info('Sending order to Google Sheets', { orderId: orderData.data.Order_ID }, 'GOOGLE_SHEETS');

    // Create a promise that resolves after form submission
    return new Promise((resolve) => {
      // Create hidden iframe to receive response
      const iframeName = 'googleSheetFrame_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SCRIPT_URL;
      form.target = iframeName;
      form.style.display = 'none';

      // Add data as hidden input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(orderData);
      form.appendChild(input);

      document.body.appendChild(form);

      // Submit form
      form.submit();

      // Clean up after a delay and assume success
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        
        logger.info('Order sent to Google Sheets via form', { orderId: orderData.data.Order_ID }, 'GOOGLE_SHEETS');
        resolve({
          success: true,
          message: 'Order sent successfully',
        });
      }, 2000);
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to send order to Google Sheets', err, 'GOOGLE_SHEETS');
    return {
      success: false,
      message: err.message || 'Failed to send order',
    };
  }
}

/**
 * Create order payload for Google Sheets
 */
export function createOrderPayload(
  orderId: string,
  userId: string,
  restaurantName: string,
  items: OrderItem[],
  customer: CustomerInfo,
  pricing: OrderPricing,
  termsAccepted: boolean = true
): GoogleSheetOrderPayload {
  const itemsJSON = JSON.stringify(items);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const orderTime = formatDateForSheets();

  return {
    sheetName: 'Orders',
    action: 'addOrder',
    data: {
      Order_ID: orderId,
      User_ID: userId,
      Restaurant_Name: restaurantName,
      Items_JSON: itemsJSON,
      Total_Items: totalItems,
      Subtotal: pricing.subtotal,
      Tax_Amount: pricing.tax,
      Delivery_Fee: pricing.deliveryFee || 0,
      Total_Price: pricing.total,
      Customer_Name: customer.name,
      Customer_Phone: customer.phone,
      Customer_Email: customer.email || '',
      Customer_Address: customer.address,
      Latitude: customer.lat,
      Longitude: customer.lng,
      Order_Time: orderTime,
      Order_Status: 'Pending',
      Terms_Accepted: termsAccepted ? 'Yes' : 'No',
      Terms_Accepted_At: termsAccepted ? orderTime : '',
      Admin_Notes: '',
      Invoice_Trigger: 'No',
      Invoice_URL: '',
      Created_At: orderTime,
      Updated_At: orderTime,
    },
  };
}

/**
 * Create or update user in Google Sheets
 */
export async function saveUserToGoogleSheet(customer: CustomerInfo): Promise<GoogleSheetResponse> {
  if (typeof document === 'undefined') {
    return { success: false, message: 'Client-side only' };
  }
  
  const userId = generateUserId(customer.phone);
  const now = formatDateForSheets();

  const payload: GoogleSheetUserPayload = {
    sheetName: 'Users',
    action: 'addOrUpdateUser',
    data: {
      User_ID: userId,
      Name: customer.name,
      Phone: customer.phone,
      Email: customer.email || '',
      Address: customer.address,
      Lat: customer.lat,
      Long: customer.lng,
      Created_At: now,
      Total_Orders: 1,
      Last_Order_At: now,
      FCM_Token: customer.fcmToken || '',
    },
  };

  try {
    logger.info('Saving user to Google Sheets', { userId }, 'GOOGLE_SHEETS');

    // Use form submission to bypass CORS
    const iframeName = 'userSheetFrame_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_SCRIPT_URL;
    form.target = iframeName;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // Clean up after delay
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 2000);

    logger.info('User saved to Google Sheets', { userId }, 'GOOGLE_SHEETS');
    return {
      success: true,
      message: 'User saved successfully',
    };
  } catch (error) {
    logger.error('Failed to save user', error instanceof Error ? error : new Error(String(error)), 'GOOGLE_SHEETS');
    return {
      success: false,
      message: 'Failed to save user information',
    };
  }
}

/**
 * Complete order submission flow
 * 1. Save user to Users sheet
 * 2. Save order to Orders sheet
 * 3. Return order ID for WhatsApp redirect
 */
export async function submitCompleteOrder(
  restaurantName: string,
  items: OrderItem[],
  customer: CustomerInfo,
  pricing: OrderPricing,
  termsAccepted: boolean = true
): Promise<OrderSubmissionResult> {
  const orderId = generateOrderId();
  const userId = generateUserId(customer.phone);

  try {
    // Step 1: Save user (non-blocking, can fail silently)
    saveUserToGoogleSheet(customer).catch(err => {
      logger.warn('User save failed but continuing with order', err, 'GOOGLE_SHEETS');
    });

    // Step 2: Save order (critical)
    const orderPayload = createOrderPayload(orderId, userId, restaurantName, items, customer, pricing, termsAccepted);
    const orderResult = await sendOrderToGoogleSheet(orderPayload);

    if (orderResult.success) {
      return {
        success: true,
        orderId,
        message: 'Order saved successfully',
      };
    } else {
      return {
        success: false,
        orderId,
        message: orderResult.message || 'Failed to save order',
      };
    }
  } catch (error) {
    logger.error('Order submission failed', error instanceof Error ? error : new Error(String(error)), 'GOOGLE_SHEETS');
    return {
      success: false,
      orderId,
      message: 'An unexpected error occurred',
    };
  }
}

// ============================================
// TypeScript Interfaces
// ============================================

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  vegNonVeg?: 'Veg' | 'Non-Veg';
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  lat?: number;
  lng?: number;
  fcmToken?: string;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export interface GoogleSheetOrderData {
  Order_ID: string;
  User_ID: string;
  Restaurant_Name: string;
  Items_JSON: string;
  Total_Items: number;
  Subtotal: number;
  Tax_Amount: number;
  Delivery_Fee: number;
  Total_Price: number;
  Customer_Name: string;
  Customer_Phone: string;
  Customer_Email: string;
  Customer_Address: string;
  Latitude?: number;
  Longitude?: number;
  Order_Time: string;
  Order_Status: string;
  Terms_Accepted: string;
  Terms_Accepted_At: string;
  Admin_Notes: string;
  Invoice_Trigger: string;
  Invoice_URL: string;
  Created_At: string;
  Updated_At: string;
}

export interface GoogleSheetOrderPayload {
  sheetName: 'Orders';
  action: 'addOrder';
  data: GoogleSheetOrderData;
}

export interface GoogleSheetUserData {
  User_ID: string;
  Name: string;
  Phone: string;
  Email: string;
  Address: string;
  Lat?: number;
  Long?: number;
  Created_At: string;
  Total_Orders: number;
  Last_Order_At: string;
  FCM_Token?: string;
}

export interface GoogleSheetUserPayload {
  sheetName: 'Users';
  action: 'addOrUpdateUser';
  data: GoogleSheetUserData;
}

export interface GoogleSheetResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  userId?: string;
}

export interface OrderSubmissionResult {
  success: boolean;
  orderId: string;
  message: string;
}
