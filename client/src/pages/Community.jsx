import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { Heart, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const fetchCreations = async () => {
            if (!isLoaded) return;

            if (!user) {
                setCreations([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const token = await getToken();

                if (!token) {
                    throw new Error('Please sign in again.');
                }

                const { data } = await axios.get(
                    '/api/user/get-published-creations',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!data.success) {
                    throw new Error(
                        data.message || 'Failed to load community images.'
                    );
                }

                if (!cancelled) {
                    setCreations(
                        Array.isArray(data.creations)
                            ? data.creations
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    'Fetch community creations failed:',
                    error.response?.data || error.message
                );

                if (!cancelled) {
                    toast.error(
                        error.response?.data?.message ||
                        'Failed to load community images.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchCreations();

        return () => {
            cancelled = true;
        };
    }, [isLoaded, user?.id, getToken]);

    const handleLike = async (creation) => {
        if (!user) {
            toast.error('Please sign in to like an image.');
            return;
        }

        const idKey = String(creation.id);

        if (busyIds.includes(idKey)) return;

        try {
            setBusyIds((prev) => [...prev, idKey]);

            const token = await getToken();

            if (!token) {
                toast.error('Please sign in again.');
                return;
            }

            const { data } = await axios.post(
                '/api/user/toggle-liked-creations',
                { id: creation.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!data.success) {
                toast.error(data.message || 'Unable to update like.');
                return;
            }

            // Use the server's updated likes array.
            setCreations((prev) =>
                prev.map((item) =>
                    String(item.id) === idKey
                        ? { ...item, likes: data.likes }
                        : item
                )
            );
        } catch (error) {
            console.error(
                'Toggle like failed:',
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                'Failed to update like. Please try again.'
            );
        } finally {
            setBusyIds((prev) =>
                prev.filter((id) => id !== idKey)
            );
        }
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-4 p-4 sm:p-6 text-slate-700">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Community Creations
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Discover and like images shared by the community.
                </p>
            </div>

            <div className="bg-white flex-1 min-h-96 w-full rounded-xl overflow-y-auto p-3 sm:p-4 border border-gray-200">
                {loading ? (
                    <div className="h-full min-h-72 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <span className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                        <p className="text-sm">Loading community images...</p>
                    </div>
                ) : creations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {creations.map((creation) => {
                            const likes = Array.isArray(creation.likes)
                                ? creation.likes
                                : [];

                            const liked = user
                                ? likes.includes(user.id)
                                : false;

                            const isBusy = busyIds.includes(
                                String(creation.id)
                            );

                            return (
                                <div
                                    key={creation.id}
                                    className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100"
                                >
                                    <img
                                        src={creation.content}
                                        alt={creation.prompt || 'Community creation'}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 flex flex-col justify-end p-3 text-white bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <p className="text-sm line-clamp-3 break-words mb-2">
                                            {creation.prompt}
                                        </p>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-white/80">
                                                {creation.created_at
                                                    ? new Date(creation.created_at).toLocaleDateString()
                                                    : ''}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleLike(creation)}
                                                disabled={isBusy || !user}
                                                aria-label={
                                                    liked
                                                        ? 'Unlike image'
                                                        : 'Like image'
                                                }
                                                aria-pressed={liked}
                                                className="flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 hover:bg-black/50 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 transition-transform ${
                                                        liked
                                                            ? 'fill-red-500 text-red-500'
                                                            : 'text-white'
                                                    } ${isBusy ? '' : 'hover:scale-110'}`}
                                                />
                                                <span className="text-sm">
                                                    {likes.length}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="min-h-72 h-full flex flex-col items-center justify-center text-center gap-3 text-gray-400">
                        <ImageIcon className="w-10 h-10" />
                        <p className="font-medium text-slate-700">
                            No public images yet
                        </p>
                        <p className="text-sm">
                            Images marked public will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;