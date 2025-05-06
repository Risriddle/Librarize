// "use server"

// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI || "";

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable");
// }

// const cached = (global as any).mongoose || { conn: null, promise: null };

// const dbConnect = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     return;
//   }
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     console.log("Mongoose Import:==========================================="); // Debugging

//     cached.promise = mongoose
//       .connect(MONGODB_URI, {
//         bufferCommands: true,
//       })
//       .then((mongoose) => {
//         console.log("MongoDB Connected");
//         return mongoose;
//       })
//       .catch((err) => {
//         console.error("MongoDB Connection Error:", err);
//         throw err;
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// (global as any).mongoose = cached;
// export default dbConnect;






"use server";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

declare global {
  // Create a global cache object to avoid multiple connections in dev
  let mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const globalWithCache = global as typeof globalThis & {
  mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

if (!globalWithCache.mongooseCache) {
  globalWithCache.mongooseCache = {
    conn: null,
    promise: null,
  };
}

const dbConnect = async () => {
  const cached = globalWithCache.mongooseCache;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
