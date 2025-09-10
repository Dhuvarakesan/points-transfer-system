import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { protect } from "./app/middleware/middleware";
import adminRoutes from './app/routes/admin.routes'; // Import the admin routes
import publicRoutes from "./app/routes/public.routes";
import userRoutes from './app/routes/user.routes';
import connectDB from "./config/db";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security middleware
app.use(cors({
  origin: process.env.ALLOWED_REGION, // Update to allow requests from the client on port 8080
  credentials: true, // If you are using cookies or authorization headers
})); // Enable CORS
app.use(morgan('common')); // Logging middleware
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection
connectDB();
// Routes for public api without authentication
app.use(publicRoutes);
// Routes for protected api with authentication
app.use('/admin',protect,adminRoutes);
app.use('/users',protect, userRoutes);

// Root route
// app.get("/", (req: Request, res: Response) => {
  
// });



// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred.",
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// for http localhost without certificate
app.listen(port, () => {
  console.log(`
    🎉 **Welcome to the ASCENSION Server!** 🎉
    --------------------------------------------
    🚀 **Status**: Server is up and running smoothly!`)
  });    

// for https localhost with certificate
// https.createServer(options, app).listen(port, () => {
//   console.log(`
//     🎉 **Welcome to the Points Transfer System Server!** 🎉
//     --------------------------------------------
//     🚀 **Status**: Server is up and running smoothly!
//     🌐 **Current Status**: ONLINE
//     🟢 **Port**: ${port}
//     --------------------------------------------
//     Thank you for using our service! 😊
//     `);
// }
// );