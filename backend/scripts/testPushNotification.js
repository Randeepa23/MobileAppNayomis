const { initFirebase, sendToTopic } = require('../services/pushNotificationService');

async function run() {
  console.log('Testing Firebase Push Notification Service...');
  const initialized = initFirebase();
  if (!initialized) {
    console.error('Failed to initialize Firebase.');
    process.exit(1);
  }

  console.log('Sending test message to topic "food_safety_alerts"...');
  const response = await sendToTopic('food_safety_alerts', {
    title: 'Nayomi Food App - Push Notification Test',
    body: 'Firebase Cloud Messaging is active and configured correctly!',
    data: {
      type: 'test_notification',
      timestamp: new Date().toISOString(),
    },
  });

  if (response) {
    console.log('SUCCESS! Firebase FCM message ID:', response);
  } else {
    console.error('Failed to send test push notification.');
  }
}

run();
