importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "gen-lang-client-0862206112",
  appId: "1:921258652818:web:0046161f386cc8e31be24b",
  apiKey: "AIzaSyDlLSc1tNUC5l9bCYKmA7JNmc2CjhDzS_Y",
  authDomain: "gen-lang-client-0862206112.firebaseapp.com",
  messagingSenderId: "921258652818",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez un nouveau message.',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
