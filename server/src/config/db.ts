import dotenv from "dotenv";
import mongoose from 'mongoose';
import { mongoURI } from "./config";


const connectDB = async () => {
  dotenv.config();
  try {

    await mongoose.connect(mongoURI);
    console.log(`    🛢️  **Database**: Successfully connected
    🌐 **Current Status**: ONLINE
    🟢 **Port**: ${process.env.port}
     --------------------------------------------
   
    `);
  } catch (error) {
    `
    🛢️ **Database**: Failed to connect
    🌐 **Current Status**: ONLINE
    🟢 **Port**: ${process.env.port}
     --------------------------------------------
   
    `
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;