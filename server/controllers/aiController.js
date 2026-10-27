import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';

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
            model: "gemini-3.5-flash-lite",
            messages: [
                {
                    role: "user",
                    content: `${prompt}
                    Write a complete, well-structured article with an introduction,
appropriate headings, detailed explanations, and a conclusion.
Complete all sections and do not stop mid-sentence.`,
                },
            ],
            temperature: 0.7,
            max_tokens: Math.ceil(Number(length) * 1.5)
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
    }catch (error) {
    console.error("Generate article failed:", {
        message: error.message,
        name: error.name,
        status: error.status,
        code: error.code
    });

    return res.status(500).json({
        success: false,
        message: error.message
    });
}
}

export const generateBlogTitle = async (req, res) => {
    try {
        const userId = req.userId;
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a keyword."
            });
        }

        if (plan !== 'premium' && free_usage >= 20) {
            return res.status(403).json({
                success: false,
                message: "Limit reached. Upgrade to continue."
            });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3.5-flash-lite",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 600
        });

        const content = response.choices[0].message.content;

        await Promise.all([
            sql`
                INSERT INTO creations (user_id, prompt, content, type)
                VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
            `,
            plan !== 'premium'
                ? clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        free_usage: free_usage + 1
                    }
                })
                : Promise.resolve()
        ]);

        return res.json({
            success: true,
            content
        });

    } catch (error) {
        console.error("Generate blog titles failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to generate blog titles. Please try again."
        });
    }
};

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
        if (!resume) {
          return res.json({
             success: false,
              message: "Please upload a resume PDF"
           });
          }

        if(resume.size > 5 * 1024 * 1024){
            return res.json({ success: false, message: 'Resume size is exceeding allowed size (5MB)' });
        }

        const databuffer = fs.readFileSync(resume.path);    

        //parse the pdf to text using pdf-parse
       

        const parser = new PDFParse({ data: databuffer });
        const result = await parser.getText();
        const text = result.text;
        
        await parser.destroy();

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