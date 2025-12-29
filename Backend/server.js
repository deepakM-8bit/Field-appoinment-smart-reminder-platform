import express from 'express';
import cors from 'cors';
import "./cron/reminder.cron.js";
import authRouter from './Routers/authRouter.js';
import technicianRouter from './Routers/technicianRouter.js';
import customerRouter from './Routers/customerRouter.js';
import appointmentRouter from './Routers/appointmentRouter.js';
import otpRouter from './Routers/otpRouter.js';
import dashboardRouter from './Routers/dashboardRouter.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth",authRouter);
app.use("/api/technicians",technicianRouter);
app.use("/api/customers",customerRouter);
app.use("/api/appointments",appointmentRouter);
app.use("/api/otp",otpRouter);
app.use("/api/dashboard", dashboardRouter);


app.listen(port, ()=>{
    console.log(`server is running on port: http://localhost:${port}`);
});