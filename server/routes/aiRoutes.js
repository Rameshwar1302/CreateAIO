import express from 'express'
import { generateArticle, generateBlogTitle, generateImage, removeBackgroundImage, removeObjectImage, resumeReview } from '../controllers/aiController.js';
import {auth} from '../middlewares/auth.js'
import { upload } from '../config/multer.js';

const aiRouter = express.Router();

aiRouter.post('/write-article', auth, generateArticle);
aiRouter.post('/blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-images', auth, generateImage);
aiRouter.post('/review-resume',upload.single('resume'), auth, resumeReview);
aiRouter.post('/remove-background', upload.single('image'), auth, removeBackgroundImage);
aiRouter.post('/remove-object',upload.single('image'), auth, removeObjectImage);

export default aiRouter;