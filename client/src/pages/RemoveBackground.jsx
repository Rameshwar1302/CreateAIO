import React, { useEffect, useState } from 'react';
import {
    Eraser,
    Sparkles,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
    const [input, setInput] = useState(null);
    const [preview, setPreview] = useState('');
    const [processedImage, setProcessedImage] = useState('');
    const [loading, setLoading] = useState(false);

    const { getToken } = useAuth();

    // Generate a preview of the selected image
    useEffect(() => {
        if (!input) {
            setPreview('');
            return;
        }

        const url = URL.createObjectURL(input);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [input]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!input) {
            toast.error('Please upload an image first.');
            return;
        }

        try {
            setLoading(true);
            setProcessedImage('');

            const token = await getToken();

            if (!token) {
                toast.error('Please sign in again.');
                return;
            }

            const formData = new FormData();
            formData.append('image', input);

            const { data } = await axios.post(
                '/api/ai/remove-background',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 120000
                }
            );

            if (data.success && data.content) {
                setProcessedImage(data.content);
                toast.success('Background removed successfully!');
            } else {
                toast.error(
                    data.message || 'Failed to remove background.'
                );
            }
        } catch (error) {
            console.error(
                'Remove background error:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to remove background. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 text-slate-700">

            {/* Left: Upload and configuration */}
            <form
                onSubmit={onSubmitHandler}
                className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 text-[#ff5076]" />
                    <h1 className="text-xl font-semibold">
                        Background Remover
                    </h1>
                </div>

                <p className="mt-6 text-sm font-medium">
                    Upload Image
                </p>

                <input
                    onChange={(e) => {
                        setInput(e.target.files?.[0] || null);
                        setProcessedImage('');
                    }}
                    accept="image/*"
                    type="file"
                    className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-500"
                    required
                    disabled={loading}
                />

                <p className="text-xs text-gray-500 font-light mt-1">
                    Supported formats: JPG, PNG, WebP and other images.
                </p>

                {input && (
                    <p className="text-xs text-gray-500 mt-2">
                        Selected: {input.name}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || !input}
                    className={`w-full flex justify-center items-center gap-2
                        bg-gradient-to-r from-[#f65024] to-[#ff5076]
                        text-white px-4 py-3 mt-6 text-sm rounded-lg
                        disabled:opacity-60
                        ${loading
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                >
                    {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                        <Eraser className="w-5 h-5" />
                    )}

                    {loading
                        ? 'Removing background...'
                        : 'Remove Background'}
                </button>
            </form>

            {/* Right: Processed image */}
            <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Eraser className="w-5 h-5 text-[#ff5076]" />
                        <h1 className="text-xl font-semibold">
                            Processed Image
                        </h1>
                    </div>

                    {processedImage && (
                        <a
                            href={processedImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 text-gray-400">
                        <span className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
                        <p className="text-sm">
                            Removing the background...
                        </p>
                    </div>
                ) : processedImage ? (
                    <div
    className="mt-4 flex-1 flex items-center justify-center rounded-lg overflow-hidden"
    style={{
        backgroundColor: '#ffffff',
        backgroundImage: `
            linear-gradient(45deg, #d1d5db 25%, transparent 25%),
            linear-gradient(-45deg, #d1d5db 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #d1d5db 75%),
            linear-gradient(-45deg, transparent 75%, #d1d5db 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0'
    }}
>
    <img
        src={processedImage}
        alt="Background removed"
        className="w-full max-h-[500px] object-contain"
    />
</div>
                ) : preview ? (
                    <div className="mt-4 flex-1 flex flex-col items-center justify-center gap-3">
                        <img
                            src={preview}
                            alt="Selected original image"
                            className="w-full max-h-[400px] object-contain rounded-lg"
                        />
                        <p className="text-sm text-gray-400">
                            Original image preview
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <ImageIcon className="w-10 h-10" />
                            <p className="text-center">
                                Upload an image and click
                                {' '}“Remove Background” to get started.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveBackground;