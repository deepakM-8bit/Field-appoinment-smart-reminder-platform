import express from 'express';
import cors from 'cors';
import authRouter from './Routers/authRouter.js'

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth",authRouter);

app.listen(port, ()=>{
    console.log(`server is running on port: http://localhost:${port}`);
});