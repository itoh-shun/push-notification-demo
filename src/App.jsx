// src/App.jsx
import React, { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    // 通知許可をリクエスト
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        registerServiceWorker();
      } else {
        console.warn('Notification permission denied.');
      }
    });
  }, []);
  
  const registerServiceWorker = async () => {
    // サービスワーカーの登録
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(async (registration) => {
          console.log('Service Worker registered:', registration);

          // Push通知の許可を確認
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const response = await fetch('http://localhost:4000/vapidPublicKey');
            const vapidPublicKey = await response.text();
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });
            console.log('Subscribed to Push:', subscription);
            
            // サーバーにPushの情報を送信
            await fetch('http://localhost:4000/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription),
            });
          }
        })
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <div>
      <h1>Web Push Notification Demo</h1>
    </div>
  );
};

export default App;
