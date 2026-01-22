import express from "express";
import cors from "cors";
import "./cron/reminder.cron.js";
import authRouter from "./Routers/authRouter.js";
import technicianRouter from "./Routers/technicianRouter.js";
import customerRouter from "./Routers/customerRouter.js";
import appointmentRouter from "./Routers/appointmentRouter.js";
import otpRouter from "./Routers/otpRouter.js";
import appointmentListRouter from "./Routers/appointmentListRouter.js";
import authOtpRouter from "./Routers/authOtpRouter.js";
import { clearLine } from "readline";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("cors blocked for origin:" + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-Type", "Authorization"],
    credentials: false,
  }),
);
app.options(/.*/, cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/technicians", technicianRouter);
app.use("/api/customers", customerRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/otp", otpRouter);
app.use("/api/appointments-list", appointmentListRouter);
app.use("/api/auth", authOtpRouter);

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
