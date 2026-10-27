import { Hash, Sparkles, Copy } from 'lucide-react';
import  { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


const BlogTitle = () => {
    const blogCategories = ['General', 'Technology', 'Health', 'Finance', 'Travel', 'Food', 'Lifestyle', 'Education', 'Science', 'Entertainment', 'Sports'];
   const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false);
      const [content, setContent] = useState('');
   
      const {getToken} = useAuth();

    const onSubmitHandler = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);

        const token = await getToken();

        if (!token) {
            toast.error("Please sign in again.");
            return;
        }

        const prompt = `
Generate 10 engaging, creative, and SEO-friendly blog titles.

Keyword or topic: ${input}
Category: ${selectedCategory}

Requirements:
- Generate exactly 10 different titles.
- Make each title clear, catchy, and relevant to the keyword.
- Match the selected category and intended audience.
- Avoid repetitive titles and unnecessary clickbait.
- Return only a numbered list of titles.
- Do not write the article itself.
`;

const { data } = await axios.post(
    '/api/ai/blog-title',
    { prompt },
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

        if (data.success) {
            setContent(data.content);
        } else {
            toast.error(data.message);
        }

    } catch (error) {
        console.error("Article generation error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || error.message);
    } finally {
        setLoading(false);
    }
    }
  
      const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(content);
        toast.success('Article copied successfully!');
    } catch (error) {
        toast.error('Failed to copy article.');
    }
};
    return (
      <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
        {/* Left col */}
        <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
          <div className='flex items-center gap-3'>
            <Sparkles className='w-6 text-[#8E37EB]' />
            <h1 className='text-xl font-semibold'>Ai Blog Title Generator</h1>
          </div>
  
          <p className='mt-6 text-sm font-medium'>Keyword</p>
  
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
            placeholder='The future of artificial intelligence is...'
            required
          />
  
          <p className='mt-4 text-sm font-medium'>Category</p>
  
          <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
            {blogCategories.map((item) => (
              <span
                onClick={() => setSelectedCategory(item)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  selectedCategory === item
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-500 border-gray-300'
                }`}
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
  
          <br />
  
          <button  disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#CE41F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
            {
            loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin cursor-disable'></span>: <Hash className='w-5' />
            }
            
            Generate blog titles
          </button>
        </form>
  
        {/* Right col */}
        <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 '>
            <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Hash className='w-5 h-5 text-[#8E37EB]' />
            <h1 className='text-xl font-semibold'>Generated Blog Titles</h1>
          </div>

    {content && (
        <button
            type="button"
            onClick={handleCopy}
            title="Copy article"
            className='flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition cursor-pointer'
        >
            <Copy className='w-4 h-4' />
            Copy
        </button>
    )}
</div>
           {!content? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Hash className='w-9 h-9' />
              <p>Enter a keyword and click “Generate blog titles” to get started</p>
            </div>
          </div> ) : 
          (
             <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset-tw'><Markdown>{content}</Markdown></div>                     </div>
          )}
        </div>
      </div>
  )
}

export default BlogTitle