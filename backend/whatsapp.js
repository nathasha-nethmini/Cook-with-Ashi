require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send WhatsApp message
function sendAdminWhatsApp(order) {
  console.log("Sending WhatsApp:", order); // log order details

  let mapLink = "";
  if (order.location && order.location.lat && order.location.lng) {
    mapLink = `\n📍 Map: https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`;
  }

  client.messages
    .create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${process.env.ADMIN_PHONE_NUMBER}`,
      body: `🍽️ New Order Received!\nCustomer: ${order.name}\nPhone: ${order.phone}\nMeal: ${order.meal}\nAddress: ${order.address}${mapLink}`
    })
    .then(message => console.log("WhatsApp sent, SID:", message.sid))
    .catch(err => console.error("WhatsApp error:", err));
}


module.exports = sendAdminWhatsApp;
