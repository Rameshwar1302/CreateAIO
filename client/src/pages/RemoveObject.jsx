import React, { useEffect, useState } from 'react';
import {
    Eraser,
    Scissors,
    Sparkles,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
    const [input, setInput] = useState(null);
    const [object, setObject] = useState('');
    const [preview, setPreview] = useState('');
    const [processedImage, setProcessedImage] = useState('');
    const [loading, setLoading] = useState(false);

    const { getToken } = useAuth();

    // Preview the uploaded image
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
            toast.error('Please upload an image.');
            return;
        }

        if (!object.trim()) {
            toast.error('Please describe the object to remove.');
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
            formData.append('object', object.trim());

            const { data } = await axios.post(
                '/api/ai/remove-object',
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
                toast.success('Object removed successfully!');
            } else {
                toast.error(
                    data.message || 'Failed to remove object.'
                );
            }
        } catch (error) {
            console.error(
                'Remove object error:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to remove object. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 text-slate-700">

            {/* Left: Object removal configuration */}
            <form
                onSubmit={onSubmitHandler}
                className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 text-[#4a7aff]" />
                    <h1 className="text-xl font-semibold">
                        Object Remover
                    </h1>
                </div>

                <p className="mt-6 text-sm font-medium">
                    Upload Image
                </p>

                <input
                    type="file"
                    accept="image/*"
                    required
                    disabled={loading}
                    onChange={(e) => {
                        setInput(e.target.files?.[0] || null);
                        setProcessedImage('');
                    }}
                    className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-500 disabled:opacity-60"
                />

                <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, WebP and other images.
                </p>

                {input && (
                    <p className="text-xs text-gray-500 mt-2">
                        Selected: {input.name}
                    </p>
                )}

                <p className="mt-6 text-sm font-medium">
                    Describe object to remove
                </p>

                <textarea
                    value={object}
                    onChange={(e) => setObject(e.target.value)}
                    rows={3}
                    maxLength={120}
                    disabled={loading}
                    className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-blue-500 disabled:opacity-60"
                    placeholder="e.g. the person wearing a red shirt"
                    required
                />

                <p className="text-xs text-gray-500 mt-1">
                    Describe the specific object clearly.
                </p>

                <button
                    type="submit"
                    disabled={loading || !input}
                    className={`w-full flex justify-center items-center gap-2
                        bg-gradient-to-r from-[#417df6] to-[#8e37eb]
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
                        <Scissors className="w-5 h-5" />
                    )}

                    {loading
                        ? 'Removing object...'
                        : 'Remove Object'}
                </button>
            </form>

            {/* Right: Processed image */}
            <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-[#4a7aff]" />
                        <h1 className="text-xl font-semibold">
                            Processed Image
                        </h1>
                    </div>

                    {processedImage && (
                        <a
                            href={processedImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                            title="Open full image"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 text-gray-400">
                        <span className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        <p className="text-sm">
                            Removing the selected object...
                        </p>
                    </div>
                ) : processedImage ? (
                    <div className="mt-4 flex-1 flex items-center justify-center">
                        <img
                            src={processedImage}
                            alt={`Image with ${object} removed`}
                            className="w-full max-h-[500px] object-contain rounded-lg"
                        />
                    </div>
                ) : preview ? (
                    <div className="mt-4 flex-1 flex flex-col items-center justify-center gap-3">
                        <img
                            src={preview}
                            alt="Original uploaded image"
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
                                Upload an image and describe the object
                                you want to remove.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RemoveObject;