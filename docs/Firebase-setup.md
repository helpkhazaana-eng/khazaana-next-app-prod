# Firebase & FCM Setup Guide

## 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project (e.g., `khazaana-app`).
3. Go to **Project Settings** (gear icon > Project settings).

## 2. Cloud Messaging (FCM) Configuration

1. Click on the **Cloud Messaging** tab.
2. Under **Web configuration**:
   - If you haven't generated a Key pair yet, click **Generate key pair**.
   - **Copy the Key pair** value. This is your **VAPID Key**.
   - Add this to your `.env.local` file:
     ```env
     NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_copied_vapid_key
     ```

## 3. General Config (If not already set)

1. Go to the **General** tab in Project Settings.
2. Scroll down to **Your apps**.
3. Select the Web app (`</>`).
4. Copy the `firebaseConfig` object properties.
5. Ensure your `.env.local` has these values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
   ```

## 4. Service Account (For Admin Actions - Optional)

If you plan to send notifications from the server (Next.js API routes) in the future instead of Google Apps Script:
1. Go to **Service accounts** tab.
2. Click **Generate new private key**.
3. Save the JSON file securely (do not commit to Git).

## 5. Testing

1. Run the app locally.
2. Go to Checkout.
3. Allow Notifications when prompted.
4. Check the console for the "FCM Token" log or check the `Users` sheet in Google Sheets after placing an order.
