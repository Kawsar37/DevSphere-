import mongoose from "mongoose";
import { ENV } from "./env.js";

let memoryServer: any = null;

export async function connectDB(): Promise<void> {
  try {
    // Attempt standard connection to specified MONGODB_URI
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error: any) {
    if (ENV.NODE_ENV === "development" || ENV.NODE_ENV === "test") {
      console.warn(`[Database] External MongoDB connection failed (${error.message}). Initializing embedded in-memory MongoDB for local development/testing...`);
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] Connected to in-memory MongoDB instance at ${uri}`);
      } catch (memErr: any) {
        console.error("[Database] Failed to start in-memory MongoDB:", memErr);
        throw memErr;
      }
    } else {
      console.error("[Database] Critical MongoDB connection failure:", error);
      throw error;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
