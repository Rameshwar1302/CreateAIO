import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, getAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.use(cors());
await connectCloudinary();

app.use(express.json());
app.use(clerkMiddleware())
const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("Server is live");
})

app.use('/api/ai', aiRouter)
app.use('/api/user',userRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listining on port ${PORT}`);
})


