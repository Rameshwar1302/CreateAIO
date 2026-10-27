import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/react';
import {
    Sparkles,
    SquarePen,
    Hash,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreationItem from '../components/CreationItem';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const TYPE_META = {
    article: {
        label: 'Article',
        plural: 'Articles',
        Icon: SquarePen,
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        tile: 'bg-blue-50 text-blue-600',
    },
    'blog-title': {
        label: 'Blog title',
        plural: 'Blog titles',
        Icon: Hash,
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        tile: 'bg-purple-50 text-purple-600',
    },
    image: {
        label: 'Image',
        plural: 'Images',
        Icon: ImageIcon,
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        tile: 'bg-emerald-50 text-emerald-600',
    },
    file: {
        label: 'Resume review',
        plural: 'Resume reviews',
        Icon: FileText,
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        tile: 'bg-teal-50 text-teal-600',
    },
};

const FALLBACK_META = {
    label: 'Other',
    plural: 'Other',
    Icon: Sparkles,
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    tile: 'bg-gray-100 text-gray-600',
};

const getMeta = (type) => TYPE_META[type] || FALLBACK_META;

const getId = (item, index) => item.id ?? item._id ?? index;

const Dashboard = () => {
    const { user } = useUser();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState('all');

    // Fetch actual creations belonging to the logged-in user
    useEffect(() => {
        let cancelled = false;

        const getDashboardData = async () => {
            if (!isLoaded) return;

            if (!isSignedIn) {
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
                    '/api/user/get-user-creations',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!data.success) {
                    throw new Error(
                        data.message || 'Failed to fetch creations.'
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
                    'Dashboard fetch error:',
                    error.response?.data || error.message
                );

                if (!cancelled) {
                    toast.error(
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to load creations.'
                    );
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        getDashboardData();

        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded, isSignedIn]);

    // Calculate counts from real database results
    const counts = useMemo(() => {
        const result = {};

        creations.forEach((creation) => {
            result[creation.type] =
                (result[creation.type] || 0) + 1;
        });

        return result;
    }, [creations]);

    // Filter creations by type
    const visible = useMemo(() => {
        if (filter === 'all') return creations;

        return creations.filter(
            (creation) => creation.type === filter
        );
    }, [creations, filter]);

    const handleFilter = (key) => {
        setFilter(key);
        setExpandedId(null);
    };

    const stats = [
        {
            label: 'Total creations',
            value: creations.length,
            Icon: Sparkles,
            tile: 'bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white',
        },
        ...Object.keys(TYPE_META).map((type) => ({
            label: TYPE_META[type].plural,
            value: counts[type] || 0,
            Icon: TYPE_META[type].Icon,
            tile: TYPE_META[type].tile,
        })),
    ];

    const filters = [
        {
            key: 'all',
            label: 'All',
            count: creations.length,
        },
        ...Object.keys(TYPE_META).map((type) => ({
            key: type,
            label: TYPE_META[type].plural,
            count: counts[type] || 0,
        })),
    ];

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-6">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Welcome back
                    {user?.firstName ? `, ${user.firstName}` : ''}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Pick up where you left off, or start something new.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map(({ label, value, Icon, tile }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 sm:px-6 bg-white rounded-xl border border-gray-200"
                    >
                        <div className="min-w-0">
                            <p className="text-sm text-slate-500 truncate">
                                {label}
                            </p>

                            <h2 className="text-2xl font-semibold text-slate-800">
                                {value}
                            </h2>
                        </div>

                        <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center ${tile}`}
                        >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent creations */}
            <section className="mt-6 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-lg font-medium text-slate-800">
                        Recent creations
                    </h2>

                    <div
                        className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        role="tablist"
                        aria-label="Filter creations"
                    >
                        {filters.map(({ key, label, count }) => {
                            const active = filter === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => handleFilter(key)}
                                    className={`shrink-0 whitespace-nowrap px-3 py-1 text-sm rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C81F6] ${
                                        active
                                            ? 'bg-gradient-to-r from-[#3C81F6] to-[#9834EA] text-white border-transparent'
                                            : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {label}

                                    <span
                                        className={`ml-1.5 text-xs ${
                                            active
                                                ? 'text-white/80'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                        <span className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />

                        <p className="mt-4 text-sm text-slate-500">
                            Loading your creations...
                        </p>
                    </div>
                ) : visible.length > 0 ? (
                    <div className="space-y-3">
                        {visible.map((item, index) => {
                            const id = getId(item, index);

                            return (
                                <CreationItem
                                    key={id}
                                    item={item}
                                    meta={getMeta(item.type)}
                                    expanded={expandedId === id}
                                    onToggle={() =>
                                        setExpandedId(
                                            expandedId === id
                                                ? null
                                                : id
                                        )
                                    }
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>

                        <p className="mt-4 font-medium text-slate-800">
                            {filter === 'all'
                                ? 'No creations yet'
                                : 'Nothing here yet'}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {filter === 'all'
                                ? 'Write an article or generate an image and it will show up here.'
                                : 'Create something in this category and it will show up here.'}
                        </p>

                        <Link
                            to="/ai/write-article"
                            className="mt-5 px-4 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-[#3C81F6] to-[#9834EA] hover:opacity-90 transition-opacity"
                        >
                            Write an article
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;