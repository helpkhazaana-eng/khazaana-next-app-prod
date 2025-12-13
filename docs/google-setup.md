# Google Sheets & Apps Script Setup Guide

## 1. Google Sheets Structure

You need to set up your Google Sheet with the following tabs and headers. This is the **single source of truth** for your data.

### Tab 1: `Users`
Columns:
1. `User_ID` (A)
2. `Name` (B)
3. `Phone` (C)
4. `Email` (D)
5. `Address` (E)
6. `Lat` (F)
7. `Long` (G)
8. `Created_At` (H)
9. `Total_Orders` (I)
10. `Last_Order_At` (J)
11. `FCM_Token` (K)

### Tab 2: `Orders`
Columns:
1. `Order_ID` (A)
2. `User_ID` (B)
3. `Restaurant_Name` (C)
4. `Items_JSON` (D)
5. `Total_Items` (E)
6. `Subtotal` (F)
7. `Tax_Amount` (G)
8. `Delivery_Fee` (H)
9. `Total_Price` (I)
10. `Customer_Name` (J)
11. `Customer_Phone` (K)
12. `Customer_Email` (L)
13. `Customer_Address` (M)
14. `Latitude` (N)
15. `Longitude` (O)
16. `Order_Time` (P)
17. `Order_Status` (Q)
18. `Terms_Accepted` (R)
19. `Terms_Accepted_At` (S)
20. `Admin_Notes` (T)
21. `Invoice_Trigger` (U)
22. `Invoice_URL` (V)
23. `Created_At` (W)
24. `Updated_At` (X)

### Tab 3: `SystemLogs` (NEW)
**Purpose:** Stores application errors and critical events for monitoring.
Columns:
1. `Timestamp` (A)
2. `Level` (B) - e.g., ERROR, CRITICAL, INFO
3. `Message` (C)
4. `Context` (D) - JSON string of extra details
5. `User_Agent` (E)
6. `Session_ID` (F)
7. `URL` (G)

### Tab 4: `Analytics` (NEW)
**Purpose:** Stores cached analytics data to ensure fast loading and data reliability ("backup").
Columns:
1. `Timestamp` (A) - When the snapshot was taken
2. `Data_JSON` (B) - The full calculated analytics JSON payload


---

## 2. Google Apps Script Deployment

1. Open your Google Sheet.
2. Go to **Extensions > Apps Script**.
3. **Delete any existing code** in `Code.gs`.
4. **Copy and Paste** the full script provided in `GOOGLE_APPS_SCRIPT_FINAL.js` (I will generate this file for you).
5. **Save** the project (Cmd/Ctrl + S).

### Setting up Triggers (CRITICAL for Daily Alerts)
To receive the daily email summary at 9 PM IST:
1. In the Apps Script editor, go to the **Triggers** (clock icon) in the left sidebar.
2. Click **+ Add Trigger** (bottom right).
3. Configure:
   - **Choose which function to run:** `sendDailyReport`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** `Time-driven`
   - **Select type of time based trigger:** `Day timer`
   - **Select time of day:** `9pm to 10pm`
4. Click **Save**. You may need to authorize permissions for sending emails.

### Deploying as Web App
1. Click **Deploy > New deployment**.
2. **Select type:** `Web app` (gear icon).
3. **Description:** "Production V2 - Analytics & Monitoring"
4. **Execute as:** `Me` (your email).
5. **Who has access:** `Anyone` (IMPORTANT).
6. Click **Deploy**.
7. **Copy the Web App URL**.
8. Update your `.env.local` file with:
   ```env
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=your_copied_url_here
   ```

---

## 3. Analytics Logic (How it works)
The script now includes a `getAnalytics` action that calculates:
1. **Most Ordered Dish**: Parses `Items_JSON` from all orders.
2. **Most Famous Restaurant**: Counts orders per restaurant.
3. **Top Users**: Aggregates spend and order count by phone number.
4. **Average Order Value (AOV)**: Total Revenue / Total Orders.
5. **Best Time**: Analyzes `Order_Time` to find peak hours.
6. **Revenue Charts**: Generates daily/monthly revenue data points.

This runs entirely on Google Servers, so your Admin Portal remains fast.
