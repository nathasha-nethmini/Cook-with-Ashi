const twilio = require("twilio");


// Twilio credentials from dashboard
const accountSid = process.env.TWILIO_SID;
const authToken =process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Function to send WhatsApp message
function sendAdminWhatsApp(order) {
  client.messages
    .create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, // Twilio Sandbox number
      to: `whatsapp:${process.env.ADMIN_PHONE_NUMBER}`,   // Admin's WhatsApp number
      body: `🍽️ New Order Received!\n\nCustomer: ${order.name}\nPhone: ${order.phone}\nMeal: ${order.meal}\nAddress: ${order.address}`
    })
    .then(message => console.log("WhatsApp sent, SID:", message.sid))
    .catch(err => console.error("WhatsApp error:", err));
}

module.exports = sendAdminWhatsApp;
