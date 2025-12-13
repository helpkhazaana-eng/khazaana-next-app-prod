// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCGmXqEIfyrB3bgZthZ5-Tkuzv93AqLHrk",
  authDomain: "khazaana-app.firebaseapp.com",
  projectId: "khazaana-app",
  storageBucket: "khazaana-app.appspot.com",
  messagingSenderId: "48257777320",
  appId: "1:48257777320:web:a8fe6d7a63b649995a8c9d",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/logo.png', // Path to your logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
