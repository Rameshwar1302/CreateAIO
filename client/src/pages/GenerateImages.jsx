import React, { useState } from 'react';
import {
    Hash,
    Sparkles,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
    const imageStyles = [
        'Realistic',
        'Cartoon',
        'Abstract',
        'Minimalist',
        'Ghibli',
        'Anime Style',
        'Cyberpunk',
        'Fantasy',
        'Pop Art',
        'Surrealism',
        '3D',
        'Portrait',
        'Landscape'
    ];

    const [selectedStyle, setSelectedStyle] = useState('Realistic');
    const [input, setInput] = useState('');
    const [publish, setPublish] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState('');

    const { getToken } = useAuth();

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setGeneratedImage('');

            const token = await getToken();

            if (!token) {
                toast.error('Please sign in again.');
                return;
            }
            const prompt = `Generate an image of ${input} in ${selectedStyle} style`

            const { data } = await axios.post(
                '/api/ai/generate-images',
                {
                    prompt,
                    publish
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (data.success && data.content) {
                setGeneratedImage(data.content);
                toast.success('Image generated successfully!');
            } else {
                toast.error(
                    data.message || 'Failed to generate image.'
                );
            }

        } catch (error) {
            console.error(
                'Image generation error:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to generate image. Please try again.'
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 text-slate-700">

            {/* Left: Image Configuration */}
            <form
                onSubmit={onSubmitHandler}
                className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 text-[#00AE57]" />
                    <h1 className="text-xl font-semibold">
                        AI Image Generator
                    </h1>
                </div>

                <p className="mt-6 text-sm font-medium">
                    Describe your Image
                </p>

                <textarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    rows={4}
                    maxLength={900}
                    className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-green-500"
                    placeholder="Describe the image you want to generate..."
                    required
                    disabled={loading}
                />

                <p className="mt-4 text-sm font-medium">
                    Style
                </p>

                <div className="mt-3 flex gap-3 flex-wrap">
                    {imageStyles.map((item) => (
                        <button
                            type="button"
                            onClick={() => setSelectedStyle(item)}
                            disabled={loading}
                            className={`text-xs px-4 py-1 border rounded-full transition
                                disabled:cursor-not-allowed
                                ${
                                    selectedStyle === item
                                        ? 'bg-green-50 text-green-700 border-green-500'
                                        : 'text-gray-500 border-gray-300 hover:border-green-400'
                                }`}
                            key={item}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Public / Private Toggle */}
                <div className="my-6 flex items-center gap-2">
                    <label className="relative cursor-pointer">
                        <input
                            type="checkbox"
                            checked={publish}
                            onChange={(e) =>
                                setPublish(e.target.checked)
                            }
                            disabled={loading}
                            className="sr-only peer"
                        />

                        <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-600 transition" />

                        <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4" />
                    </label>

                    <p className="text-sm">
                        Make this image Public
                    </p>
                </div>

                {/* Generate Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center gap-2
                        bg-gradient-to-r from-[#00AE57] to-[#04FF50]
                        text-white px-4 py-3 mt-6 text-sm rounded-lg
                        disabled:opacity-60
                        ${
                            loading
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer'
                        }`}
                >
                    {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}

                    {loading
                        ? 'Generating image...'
                        : 'Generate image'}
                </button>
            </form>

            {/* Right: Generated Image */}
            <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-[#00AE57]" />

                        <h1 className="text-xl font-semibold">
                            Generated Image
                        </h1>
                    </div>

                    {generatedImage && (
                        <a
                            href={generatedImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open full image"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 border border-green-200 rounded-lg hover:bg-green-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 text-gray-400">
                        <span className="w-10 h-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />

                        <p className="text-sm">
                            Creating your image...
                        </p>
                    </div>
                ) : generatedImage ? (
                    <div className="mt-4 flex-1 flex justify-center items-center">
                        <img
                            src={generatedImage}
                            alt={`Generated image in ${selectedStyle} style`}
                            className="w-full max-h-[500px] object-contain rounded-lg"
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <ImageIcon className="w-10 h-10" />

                            <p className="text-center">
                                Describe your image and click
                                {' '}“Generate image” to get started
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateImages;