const formatWhatsAppMessage = (orderData) => {
  const { student, items, total, pickupLocation, pickupTime, orderId } = orderData;
  
  let message = `🍕 *NEW ORDER NOTIFICATION*\n\n`;
  message += `📋 *Order ID:* ${orderId}\n`;
  message += `👤 *Customer:* ${student.name}\n`;
  message += `📱 *WhatsApp:* ${student.whatsapp}\n`;
  message += `🏫 *School:* ${student.school}\n\n`;
  
  message += `🍽️ *ORDER ITEMS:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += `\n💰 *Total Amount:* $${total.toFixed(2)}\n`;
  message += `📍 *Pickup Location:* ${pickupLocation}\n`;
  message += `⏰ *Pickup Time:* ${pickupTime}\n\n`;
  message += `✅ Please confirm order preparation`;
  
  return message;
};

const sendOrderNotification = async (orderData) => {
  try {
    const message = formatWhatsAppMessage(orderData);
    
    console.log('\n=== WHATSAPP NOTIFICATION ===');
    console.log(`To: ${orderData.student.whatsapp}`);
    console.log(`Message:\n${message}`);
    console.log('=============================\n');
    
    return { success: true, message: 'Notification logged successfully' };
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return { success: false, error: error.message };
  }
};

const sendOrderConfirmation = async (orderData) => {
  try {
    const student = orderData.student;
    const message = `Hi ${student.name}! 👋\n\nYour order #${orderData.orderId} has been confirmed! 🎉\n\n📍 Pickup: ${orderData.pickupLocation}\n⏰ Time: ${orderData.pickupTime}\n💰 Total: $${orderData.total.toFixed(2)}\n\nThank you for your order! 😊`;
    
    console.log('\n=== ORDER CONFIRMATION ===');
    console.log(`To: ${student.whatsapp}`);
    console.log(`Message:\n${message}`);
    console.log('==========================\n');
    
    return { success: true, message: 'Confirmation sent successfully' };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { success: false, error: error.message };
  }
};

const sendOrderReady = async (orderData) => {
  try {
    const student = orderData.student;
    const message = `🍕 Order Ready! 🍕\n\nHi ${student.name}!\n\nYour order #${orderData.orderId} is ready for pickup! 🎉\n\n📍 Location: ${orderData.pickupLocation}\n⏰ Please collect by: ${orderData.pickupTime}\n\nSee you soon! 😊`;
    
    console.log('\n=== ORDER READY NOTIFICATION ===');
    console.log(`To: ${student.whatsapp}`);
    console.log(`Message:\n${message}`);
    console.log('=================================\n');
    
    return { success: true, message: 'Ready notification sent successfully' };
  } catch (error) {
    console.error('Ready notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderNotification,
  sendOrderConfirmation,
  sendOrderReady,
  formatWhatsAppMessage
};