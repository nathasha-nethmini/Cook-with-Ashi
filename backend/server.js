



require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const { ObjectId } = require("mongodb");
const sendAdminWhatsApp = require("./whatsapp");

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.DBURL;
const client = new MongoClient(uri);

let ordersCollection;
let menuCollection;

/* ---------- MULTER SETUP ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* ---------- DB CONNECT ---------- */
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("foodDB");
    ordersCollection = db.collection("orders");
    menuCollection = db.collection("menu"); // ✅ FIX
  } catch (err) {
    console.error(err);
  }
}
connectDB();

/* ---------- ORDER ROUTES ---------- */
app.post("/api/order", async (req, res) => {
  try {
    const newOrder = { ...req.body, date: new Date() };
    const result = await ordersCollection.insertOne(newOrder);

    sendAdminWhatsApp(newOrder); 
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  const orders = await ordersCollection.find().toArray();
  res.json(orders);
});

/* ---------- MENU ROUTES ---------- */
app.post("/api/menu", upload.single("image"), async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    const menuItem = {
      name: req.body.name,
      price: Number(req.body.price),
      image: req.file.filename,
      date: new Date()
    };

    const result = await menuCollection.insertOne(menuItem);
    console.log("Inserted menu item:", result.insertedId);

    res.json({ success: true, message: "Menu saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/menu", async (req, res) => {
  try {
    if (!menuCollection) {
      return res.status(500).json({ error: "DB not connected" });
    }

    const menuItems = await menuCollection
      .find()
      .sort({ date: -1 }) // newest first
      .toArray();

    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a menu item by ID
app.delete("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await menuCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: "Menu item deleted" });
    } else {
      res.status(404).json({ success: false, message: "Menu item not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ---------- STATIC IMAGE ---------- */
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => console.log("Server running on port 5000"));


