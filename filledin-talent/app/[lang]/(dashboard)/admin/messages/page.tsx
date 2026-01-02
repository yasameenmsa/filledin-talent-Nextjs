'use client';

import { useState, useEffect } from 'react';
import { Mail, Calendar, Search, Trash2, MailOpen, X, AlertTriangle } from 'lucide-react';

interface Message {
    _id: string;
    email: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; messageId: string | null }>({
        open: false,
        messageId: null,
    });

    useEffect(() => {
        fetchMessages(page);
    }, [page]);

    const fetchMessages = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/messages?page=${pageNum}&limit=10`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                setHasMore(data.pagination.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(messages.map(msg =>
                    msg._id === id ? { ...msg, status: 'read', updatedAt: new Date().toISOString() } : msg
                ));
            }
        } catch (error) {
            console.error('Failed to update message status', error);
        }
    };

    const openDeleteModal = (id: string) => {
        setDeleteModal({ open: true, messageId: id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, messageId: null });
    };

    const confirmDelete = async () => {
        if (!deleteModal.messageId) return;

        try {
            const res = await fetch(`/api/admin/messages/${deleteModal.messageId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setMessages(messages.filter(msg => msg._id !== deleteModal.messageId));
                // If we delete the last item on a page (other than page 1), go back a page
                if (messages.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchMessages(page); // Refresh current page to fill the gap if possible
                }
            }
        } catch (error) {
            console.error('Failed to delete message', error);
        } finally {
            closeDeleteModal();
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    />
                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={closeDeleteModal}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Message
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete this message? This action cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500">View and manage contact form submissions</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="flex-grow">
                    {loading ? (
                        <div className="flex items-center justify-center p-20 text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <span>Loading messages...</span>
                            </div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <Mail className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
                            <p className="text-gray-500">You haven't received any messages yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredMessages.map((msg) => (
                                <div key={msg._id} className={`p-6 transition-colors group ${msg.status === 'new' ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${msg.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {msg.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold ${msg.status === 'new' ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {msg.email}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(msg.createdAt).toLocaleString(undefined, {
                                                        dateStyle: 'long',
                                                        timeStyle: 'short'
                                                    })}
                                                    {msg.status !== 'new' && msg.updatedAt && new Date(msg.updatedAt).getTime() > new Date(msg.createdAt).getTime() + 1000 && (
                                                        <span className="flex items-center gap-1 before:content-['•'] before:mx-1 text-blue-600/80 font-medium">
                                                            Last updated: {new Date(msg.updatedAt).toLocaleString(undefined, {
                                                                timeStyle: 'short'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {msg.status.toUpperCase()}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                {msg.status === 'new' && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(msg._id)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <MailOpen className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openDeleteModal(msg._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete message"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-13 ml-13">
                                        <p className={`whitespace-pre-wrap leading-relaxed p-4 rounded-lg border mt-2 text-sm ${msg.status === 'new' ? 'bg-white border-blue-100 text-gray-800' : 'bg-gray-50 border-gray-100 text-gray-600'
                                            }`}>
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && (messages.length > 0 || page > 1) && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page <span className="font-medium text-gray-900">{page}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

