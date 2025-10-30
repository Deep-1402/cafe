import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";
import { connectDB } from "./config/config.js";
import { Users,Tenants, Subscription, AuditLog  } from "./models/master/association.js";
dotenv.config({ quiet: true });
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

connectDB();

app.use("/", router);

app.listen(process.env.PORT, () => {});
