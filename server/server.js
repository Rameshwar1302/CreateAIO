import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, getAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';

const app = express();

app.use(cors());
await connectCloudinary();

app.use(express.json());
app.use(clerkMiddleware())
const PORT = process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("Server is live");
})

// app.use((req, res, next) => {
//     try{
//   const { userId } = getAuth(req)
//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' })
//   }
//   next()
// }
// catch (error){
//      return res.status(501).json({ error: 'Clerk/server error' });
// }
// });

app.use('/api/ai', aiRouter)


app.listen(PORT, ()=>{
    console.log(`Server is listining on port ${PORT}`);
})


