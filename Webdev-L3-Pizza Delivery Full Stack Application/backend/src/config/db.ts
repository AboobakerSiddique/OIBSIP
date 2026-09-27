import mongoose from "mongoose";

/**
 * Establishes the MongoDB connection using Mongoose.
 * Does not implement any collection/schema logic — that lives in src/models.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // eslint-disable-next-line no-console
    console.warn(
      "[db] MONGODB_URI is not set. Server will start without a database connection."
    );
    return;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    // eslint-disable-next-line no-console
    console.log("[db] MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[db] MongoDB connection failed:", (err as Error).message);
    // Do not crash the process in Phase 0 — later phases may decide to exit(1) instead.
  }

  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[db] MongoDB connection error:", err.message);
  });
}

export default connectDB;
