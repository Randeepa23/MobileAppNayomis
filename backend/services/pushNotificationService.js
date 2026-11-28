const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');

let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return true;

  try {
    let credential = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.cert(parsed);
      } catch (err) {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
        credential = admin.cert(JSON.parse(decoded));
      }
    } else {
      const localKeyPath = path.join(__dirname, '..', 'config', 'firebase-service-account.json');
      if (fs.existsSync(localKeyPath)) {
        credential = admin.cert(require(localKeyPath));
      }
    }

    if (credential) {
      if (admin.getApps().length === 0) {
        admin.initializeApp({ credential });
      }
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully for FCM push notifications.');
      return true;
    } else {
      console.warn('⚠️ Firebase Admin SDK: No service account credentials found. Push notifications will be skipped.');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return false;
  }
}

// Initial attempt
initFirebase();

async function sendToToken(token, { title, body, data = {} }) {
  if (!initFirebase() || !token) return null;

  try {
    const safeData = {};
    for (const [key, val] of Object.entries(data)) {
      safeData[key] = typeof val === 'string' ? val : JSON.stringify(val);
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: safeData,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'nayomis_food_safety',
          priority: 'max',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
      },
    };

    const response = await getMessaging().send(message);
    console.log(`[FCM] Notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    console.error(`[FCM] Error sending message to token: ${error.message}`);
    return null;
  }
}

async function sendToTopic(topic, { title, body, data = {} }) {
  if (!initFirebase() || !topic) return null;

  try {
    const safeData = {};
    for (const [key, val] of Object.entries(data)) {
      safeData[key] = typeof val === 'string' ? val : JSON.stringify(val);
    }

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: safeData,
    };

    const response = await getMessaging().send(message);
    console.log(`[FCM] Notification sent to topic "${topic}": ${response}`);
    return response;
  } catch (error) {
    console.error(`[FCM] Error sending to topic "${topic}": ${error.message}`);
    return null;
  }
}

async function sendOrderStatusUpdate(token, { orderNumber, status, message, orderId }) {
  return sendToToken(token, {
    title: `Order #${orderNumber} Update: ${status}`,
    body: message || `Your order status has changed to ${status}.`,
    data: {
      type: 'order_status',
      orderNumber,
      status,
      orderId: orderId ? orderId.toString() : '',
    },
  });
}

async function sendFoodSafetyAlert(token, { boxId, alertType, message, orderId, reading }) {
  return sendToToken(token, {
    title: `⚠️ Food Safety Alert - Box ${boxId}`,
    body: message,
    data: {
      type: 'food_safety_alert',
      boxId,
      alertType,
      orderId: orderId ? orderId.toString() : '',
      temperature: reading?.temperatureC != null ? reading.temperatureC.toString() : '',
      humidity: reading?.humidityRH != null ? reading.humidityRH.toString() : '',
      gas: reading?.gasValue != null ? reading.gasValue.toString() : '',
    },
  });
}

module.exports = {
  initFirebase,
  sendToToken,
  sendToTopic,
  sendOrderStatusUpdate,
  sendFoodSafetyAlert,
};
