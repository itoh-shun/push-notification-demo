import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import webPush from 'web-push';

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// 先ほど生成したVAPIDキーをここに設定
const vapidKeys = {
  publicKey: '',
  privateKey: '',
};

webPush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// フロントエンドに公開鍵を提供するエンドポイント
app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

// 購読情報を受け取るエンドポイント
let subscriptions = [];
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// 通知を送信するエンドポイント
app.post('/sendNotification', (req, res) => {
  const notificationPayload = JSON.stringify({
    title: 'Test Notification',
    body: 'This is a test notification sent from the backend!',
  });

  const promises = subscriptions.map(sub => 
    webPush.sendNotification(sub, notificationPayload)
  );

  Promise.all(promises)
    .then(() => res.status(200).json({ message: 'Notifications sent!' }))
    .catch(err => {
      console.error('Error sending notification:', err);
      res.sendStatus(500);
    });
});

app.listen(4000, () => {
  console.log('Server started on port 4000');
});