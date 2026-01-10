require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Using Cloudinary v1 for compatibility
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const sendAdminWhatsApp = require("./whatsapp");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DATABASE SETUP ---------- */
const uri = process.env.DBURL;
const client = new MongoClient(uri);

let ordersCollection;
let menuCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("foodDB");
    ordersCollection = db.collection("orders");
    menuCollection = db.collection("menu");
  } catch (err) {
    console.error("DB connection error:", err);
  }
}
connectDB();

/* ---------- CLOUDINARY SETUP ---------- */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "menu_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

/* ---------- ORDER ROUTES ---------- */
app.post("/api/order", async (req, res) => {
  try {
    const newOrder = { ...req.body, date: new Date() };
    await ordersCollection.insertOne(newOrder);
    sendAdminWhatsApp(newOrder);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await ordersCollection.find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- MENU ROUTES ---------- */
app.post("/api/menu", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const menuItem = {
      name: req.body.name,
      price: Number(req.body.price),
      image: req.file.path, // Cloudinary URL
      date: new Date(),
    };

    const result = await menuCollection.insertOne(menuItem);

    res.json({ success: true, message: "Menu saved", data: menuItem });
  } catch (err) {
    console.error("Menu route error:", err);
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
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});
app.use(express.static(path.join(__dirname, "client/build"))); // change 'client' if your React folder has a different name

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});
/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
