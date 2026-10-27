import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, getAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express();

app.use(cors({
    origin: ['https://create-aio-psgu.vercel.app', process.env.FRONTEND_URL],
    methods: [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],
    credentials: true
}));
app.use(clerkMiddleware())
await connectCloudinary();

app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("Server is live");
})

app.use('/api/ai', aiRouter)
app.use('/api/user',userRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listining on port ${PORT}`);
})


