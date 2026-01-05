require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

// POST new order from frontend
app.post("/api/order", async (req, res) => {
  const order = {
    ...req.body,
    status: "Pending",
    date: new Date().toISOString().split("T")[0], // today
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    res.json({ message: "Order saved successfully", status: "Pending" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});




app.get("/api/order", async (req, res) => {

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
        const Today = new Date();
     const filteredOrders = data.filter(order => {
      const orderDate = new Date(order.Time); // make sure your sheet has Timestamp
      return orderDate > (Today.getDate()-1);
    });
      res.json(filteredOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
