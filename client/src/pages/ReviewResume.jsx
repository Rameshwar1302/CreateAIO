import React, { useState } from 'react';
import { Sparkles, FileText, Copy } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
    const [input, setInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    const { getToken } = useAuth();

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!input) {
            toast.error('Please upload your resume PDF.');
            return;
        }

        if (input.size > 5 * 1024 * 1024) {
            toast.error('Resume size must not exceed 5 MB.');
            return;
        }

        try {
            setLoading(true);
            setContent('');

            const token = await getToken();

            if (!token) {
                toast.error('Please sign in again.');
                return;
            }

            const formData = new FormData();
            formData.append('resume', input);

            const { data } = await axios.post(
                '/api/ai/review-resume',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 70000
                }
            );

            if (data.success && data.content) {
                setContent(data.content);
                toast.success('Resume review completed!');
            } else {
                toast.error(
                    data.message || 'Failed to review your resume.'
                );
            }

        } catch (error) {
            console.error(
                'Resume review error:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                (error.code === 'ECONNABORTED'
                    ? 'The request timed out. Please try again.'
                    : 'Failed to review resume. Please try again.')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success('Resume review copied!');
        } catch {
            toast.error('Could not copy the review.');
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 flex items-start flex-wrap gap-4 text-slate-700">

            {/* Resume upload */}
            <form
                onSubmit={onSubmitHandler}
                className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-6 text-[#00da83]" />
                    <h1 className="text-xl font-semibold">
                        Resume Review
                    </h1>
                </div>

                <p className="mt-6 text-sm font-medium">
                    Upload Resume
                </p>

                <input
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={loading}
                    required
                    onChange={(e) => {
                        setInput(e.target.files?.[0] || null);
                        setContent('');
                    }}
                    className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-500 disabled:opacity-60"
                />

                <p className="text-xs text-gray-500 font-light mt-1">
                    PDF only. Maximum size: 5 MB.
                </p>

                {input && (
                    <p className="text-xs text-gray-500 mt-2 break-all">
                        Selected: {input.name}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || !input}
                    className={`w-full flex justify-center items-center gap-2
                        bg-gradient-to-r from-[#00da83] to-[#009bb3]
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
                        <FileText className="w-5 h-5" />
                    )}

                    {loading
                        ? 'Analyzing resume...'
                        : 'Review Resume'}
                </button>
            </form>

            {/* Analysis results */}
            <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#00da83]" />
                        <h1 className="text-xl font-semibold">
                            Analysis Results
                        </h1>
                    </div>

                    {content && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 border border-green-200 rounded-lg hover:bg-green-50"
                        >
                            <Copy className="w-4 h-4" />
                            Copy
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 text-gray-400">
                        <span className="w-10 h-10 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                        <p className="text-sm text-center">
                            Reviewing your resume. This may take a little while...
                        </p>
                    </div>
                ) : content ? (
                    <div className="mt-4 flex-1 overflow-y-auto text-sm text-slate-600">
                        <div className="reset-tw">
                            <Markdown>{content}</Markdown>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <FileText className="w-10 h-10" />
                            <p className="text-center">
                                Upload your resume and click
                                {' '}“Review Resume” to get started.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewResume;