import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import addressRoutes from './routes/address.routes.js';
import orderRoutes from './routes/order.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import foodRoutes from './routes/food.routes.js';

const app = express();

// ===== CORS (Codespaces + local dev) =====
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // allow Codespaces subdomains + local dev
  const isAllowed =
    !origin ||
    origin.endsWith(".app.github.dev") ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


// app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/api/v1/foods', foodRoutes);

// console.log("process.env.ADMIN_EMAIL", process.env.ADMIN_EMAIL)
// console.log("process.env.ADMIN_EMAIL_PASSWORD", process.env.ADMIN_EMAIL_PASSWORD)


app.get('/', (req, res) => {
    res.send('API is running...');
});

export default app;
