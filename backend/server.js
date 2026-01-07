// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const fetch = require("node-fetch");

// const app = express();
// app.use(cors());
// app.use(express.json());
require("dotenv").config();  
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const sendAdminWhatsApp = require("./whatsapp");

const app = express();
app.use(cors()); // allow requests from frontend
app.use(express.json()); // parse JSON

// MongoDB connection
const uri = "mongodb+srv://admin:nethmini%40UOM@cook-with-ashi.rhe3efe.mongodb.net/foodDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let ordersCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("foodDB");
    ordersCollection = db.collection("orders");
  } catch (err) {
    console.error("DB connection error:", err);
  }
}

// Connect once when server starts
connectDB();

// API route to receive orders from React frontend
app.post("/api/order", async (req, res) => {
  const newOrder = req.body;

  try {
      await ordersCollection.insertOne({ ...newOrder, date: new Date() });
      sendAdminWhatsApp(newOrder);
    res.json({ success: true, message: "Order saved to MongoDB!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Optional: Fetch all orders (for admin page)
app.get("/api/orders", async (req, res) => {
  try {
    const allOrders = await ordersCollection.find().toArray();
    res.json(allOrders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// backend: server.js
app.put("/api/order/:id/add-to-list", async (req, res) => {
  const { id } = req.params; // the order _id

  try {
    // 1️⃣ Find the order by ID
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    // 2️⃣ Insert into "toDeliver" collection
    const toDeliverCollection = client.db("foodDB").collection("toDeliver");
    await toDeliverCollection.insertOne(order);

    // 3️⃣ Optionally update the order status in original orders collection
    await ordersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: "Added to list" } });

    res.json({ success: true, message: "Order added to delivery list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

// const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// // POST new order from frontend
// app.post("/api/order", async (req, res) => {
//   const order = {
//     ...req.body,
//     status: "Pending",
//     date: new Date().toISOString().split("T")[0], // today
//   };

//   try {
//     await fetch(GOOGLE_SCRIPT_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(order),
//     });

//     res.json({ message: "Order saved successfully", status: "Pending" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save order" });
//   }
// });




// app.get("/api/order", async (req, res) => {

//     try {
//         const response = await fetch(GOOGLE_SCRIPT_URL);
//       const data = await response.json();
//         const Today = new Date();
//      const filteredOrders = data.filter(order => {
//       const orderDate = new Date(order.Time); // make sure your sheet has Timestamp
//       return orderDate > (Today.getDate()-1);
//     });
//       res.json(filteredOrders);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch order" });
//   }
// });

// app.listen(5000, () => {
//   console.log("Backend running on http://localhost:5000");
// });


