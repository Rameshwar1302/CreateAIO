import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';

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
        console.error("Generate article error:", error);
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
        console.error("Generate Blog-title error:", error);
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

       

    
        // Run DB save and Clerk metadata update concurrently
    await 
    sql`INSERT INTO creations (user_id, prompt, content, type,publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;
    
    
        
        return res.json({ success: true, content :secure_url });
    } catch (error) {
        console.error("Generate Blog-title error:", error);
        return res.json({ success: false, message: error.message });
    }
}