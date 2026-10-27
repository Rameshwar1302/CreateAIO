import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
       
        const userId = req.userId;
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 20) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3.8-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: Number(length) 
        });

        
        const content = response.choices[0].message.content;

        
        // Run DB save and Clerk metadata update concurrently
    await Promise.all([
    sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'article')`,
    plan !== 'premium'
        ? clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
        : Promise.resolve()
]);

        
        return res.json({ success: true, content });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        
        const userId = req.userId;
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 20) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3.8-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        
        const content = response.choices[0].message.content;

    
        // Run DB save and Clerk metadata update concurrently
    await Promise.all([
    sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`,
    plan !== 'premium'
        ? clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
        : Promise.resolve()
]);

        
        return res.json({ success: true, content });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const generateImage = async (req, res) => {
    try {
        
        const userId = req.userId;
        const { prompt, publish } = req.body;
        const plan = req.plan;
       

        if (plan !== 'premium') {
            return res.json({ success: false, message: "Only Premium Users can use this feature" });
        }

        const form = new FormData()
        form.append('prompt', prompt);

        const {data} =  await axios.post('https://clipdrop-api.co/text-to-image/v1', form, {
            headers: {'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType : "arraybuffer",
        })
        
        const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;

        const  { secure_url } = await cloudinary.uploader.upload(base64Image);  

       

    
      
    await  sql`INSERT INTO creations (user_id, prompt, content, type,publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;
    
    
        
        return res.json({ success: true, content :secure_url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const removeBackgroundImage = async (req, res) => {
    try {
        
        const userId = req.userId;
        const {image} = req.file;
        const plan = req.plan;
       

        if (plan !== 'premium') {
            return res.json({ success: false, message: "Only Premium Users can use this feature" });
        }
     
        const  { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation :[
                {
                    effect : 'background_removal',
                    background_removal : 'remove_the_background'
                }
            ]
        });  
    
    await  sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Remove the Background from the image', ${secure_url}, 'image')`;
    
    
        
        return res.json({ success: true, content :secure_url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const removeObjectImage = async (req, res) => {
    try {
        
        const userId = req.userId;
        const {object} = req.body;
        const {image} = req.file;
        const plan = req.plan;
       

        if (plan !== 'premium') {
            return res.json({ success: false, message: "Only Premium Users can use this feature" });
        }
     
        const  { public_id } = await cloudinary.uploader.upload(image.path);  

        const {image_url} = cloudinary.url(public_id,{
            transformation:[{effect :`gen_remove:${object}`}],
            resource_type: 'image'
        })
    
    await  sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Removed ${object} from image`}, ${image_url}, 'image')`;
    
    
        
        return res.json({ success: true, content :image_url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resumeReview = async (req, res) => {
    try {
        
        const userId = req.userId;
        const resume = req.file;
        const plan = req.plan;
       

        if (plan !== 'premium') {
            return res.json({ success: false, message: "Only Premium Users can use this feature" });
        }

        if(resume.length > 5 * 1024 * 1024){
            return res.json({ success: false, message: 'Resume size is exceeding allowed size (5MB)' });
        }

        const databuffer = fs.readFileSync(resume.path);    

        //parse the pdf to text using pdf-parse
        const pdf = await import('pdf-parse');
        const data = await pdf(databuffer);
        const text = data.text;

        const prompt = `You are a professional resume reviewer. Please review the following resume and provide feedback on its strengths, weaknesses, and suggestions for improvement. Resume content:\n\n ${text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-3.8-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        
        const content = response.choices[0].message.content;

        const  { public_id } = await cloudinary.uploader.upload(resume.path);  

        const {resume_url} = cloudinary.url(public_id,{
            transformation:[{effect :`gen_remove:${object}`}],
            resource_type: 'image'
        })
    
     await  sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Review the uploaded resume', ${content}, 'file')`;
    
    
        
        return res.json({ success: true, content });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}