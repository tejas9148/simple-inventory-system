const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   ADMIN CHECK
========================= */
const isAdmin = [
  ClerkExpressRequireAuth(),
  (req, res, next) => {
    const role = req.auth?.sessionClaims?.publicMetadata?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  }
];

/* =========================
   ROUTES
========================= */

// READ → user + admin
app.get(
  "/api/products",
  ClerkExpressRequireAuth(),
  require("./routes/productRoutes")
);

// CREATE / UPDATE / DELETE → admin only
app.post("/api/products", isAdmin, require("./routes/productRoutes"));
app.put("/api/products/:id", isAdmin, require("./routes/productRoutes"));
app.delete("/api/products/:id", isAdmin, require("./routes/productRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
