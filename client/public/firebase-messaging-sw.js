// client/public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// Your Firebase config (use your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyAhhlRXcqhNYUJaMxy79ViGp66RR-e8iXE",
  authDomain: "annam-mithra.firebaseapp.com",
  projectId: "annam-mithra",
  storageBucket: "annam-mithra.firebasestorage.app",
  messagingSenderId: "852340191027",
  appId: "1:852340191027:web:a5b9b12a047643bc7b9846",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background Message received:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: payload.data?.tag || "default",
    data: payload.data,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
