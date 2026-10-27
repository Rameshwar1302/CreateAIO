import express from 'express'
import { generateArticle, generateBlogTitle, generateImage } from '../controllers/aiController.js';
import {auth} from '../middlewares/auth.js'

const aiRouter = express.Router();

aiRouter.post('/write-article', auth, generateArticle);
aiRouter.post('/blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-images', auth, generateImage);
export default aiRouter;