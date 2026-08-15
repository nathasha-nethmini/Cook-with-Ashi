require("dotenv").config();

// Validate required environment variables before starting
const requiredEnvVars = ["DBURL", "CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ ERROR: Missing required environment variables in backend/.env file:");
  missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
  console.error("Please add them before starting the server.");
  process.exit(1);
}
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Using Cloudinary v1 for compatibility
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const sendAdminWhatsApp = require("./whatsapp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DATABASE SETUP ---------- */
const uri = process.env.DBURL;
const client = new MongoClient(uri);

let ordersCollection;
let menuCollection;
let adminsCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("foodDB");
    ordersCollection = db.collection("orders");
    menuCollection = db.collection("menu");
    adminsCollection = db.collection("admins");

    // Seed default admin if none exists
    const adminCount = await adminsCollection.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await adminsCollection.insertOne({ username: "admin", password: hashedPassword });
      console.log("Default admin created: username: admin, password: admin123");
    }
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

/* ---------- ADMIN ROUTES ---------- */
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await adminsCollection.findOne({ username });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ admin: { id: admin._id } }, process.env.JWT_SECRET || "default_super_secret", { expiresIn: "1h" });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/update-credentials", auth, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await adminsCollection.updateOne(
      { _id: new ObjectId(req.admin.id) },
      { $set: { username, password: hashedPassword } }
    );
    res.json({ success: true, message: "Credentials updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- ORDER ROUTES ---------- */
app.post("/api/order", async (req, res) => {
  try {
    const newOrder = { ...req.body, status: "Pending",date: new Date()};
    await ordersCollection.insertOne(newOrder);
    sendAdminWhatsApp(newOrder);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", auth, async (req, res) => {
  try {
    const orders = await ordersCollection.find().toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- MENU ROUTES ---------- */
app.post("/api/menu", auth, upload.single("image"), async (req, res) => {
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

app.delete("/api/menu/:id", auth, async (req, res) => {
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

app.patch("/api/orders/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryDate } = req.body;

    const updateData = {
      status,
    };

    // Save delivery date only when confirmed
    if (status === "Confirmed" && deliveryDate) {
      updateData.deliveryDate = new Date(deliveryDate);
    }

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
