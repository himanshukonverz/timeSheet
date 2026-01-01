import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then((conn) => {
      console.log(
        "Database connected successfully || host - ",
        conn.connection.host
      );
    })
    .catch((err) => {
      console.error("Database connection failed", err);
    });
};
