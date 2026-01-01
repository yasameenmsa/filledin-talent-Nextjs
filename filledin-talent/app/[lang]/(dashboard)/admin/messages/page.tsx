'use client';

import { useState, useEffect } from 'react';
import { Mail, Calendar, Search, Trash2 } from 'lucide-react';

interface Message {
    _id: string;
    email: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading messages...</div>
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
                            <div key={msg._id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {msg.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{msg.email}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(msg.createdAt).toLocaleString(undefined, {
                                                    dateStyle: 'long',
                                                    timeStyle: 'short'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Badge */}
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {msg.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="pl-13 ml-13">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
