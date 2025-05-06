import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import "./firebaseConfig.js";

import authRouter from "./routes/auth-routes.js";
import uploadRouter from "./routes/upload-routes.js";

const server = express();
let PORT = 3000;

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  autoIndex: true,
});

server.use("/api/auth", authRouter);
server.use("/api/aws", uploadRouter);

server.listen(PORT, () => {
  console.log("listening on port -> " + PORT);
});
