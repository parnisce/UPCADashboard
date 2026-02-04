import { useState, useEffect } from 'react';
import { Send, Search, MessageSquare, CheckCheck, Loader2 } from 'lucide-react';
import type { Message } from '../../types';
import { api } from '../../services/api';

interface Conversation {
    userId: string;
    userName: string;
    userEmail?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    orderId?: string;
    avatar?: string;
}

export const AdminMessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await api.getAllConversations();
                setConversations(data.filter(c => c.userRole !== 'admin' && c.userRole !== 'upca_admin'));
                if (!selectedConversation && data.length > 0) {
                    // Find first non-admin conversation
                    const first = data.find(c => c.userRole !== 'admin' && c.userRole !== 'upca_admin');
                    if (first) setSelectedConversation(first);
                }
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return;
            try {
                const data = await api.getMessagesByUser(selectedConversation.userId, selectedConversation.orderId);
                setMessages(data);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedConversation]);

    const filteredConversations = conversations.filter(conv =>
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            await api.sendMessage(newMessage, selectedConversation.orderId);
            setNewMessage('');
            // Refresh messages immediately
            const data = await api.getMessagesByUser(selectedConversation.userId, selectedConversation.orderId);
            setMessages(data);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-upca-blue" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-12rem)] animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500 mt-1">Communicate with clients and brokers</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[calc(100%-5rem)] flex">
                {/* Conversations List */}
                <div className="w-80 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length > 0 ? filteredConversations.map((conv) => (
                            <div
                                key={`${conv.userId}-${conv.orderId || 'general'}`}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedConversation?.userId === conv.userId && selectedConversation?.orderId === conv.orderId
                                    ? 'bg-upca-blue/5 border-l-4 border-l-upca-blue'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-upca-blue/10 overflow-hidden flex items-center justify-center text-upca-blue font-bold flex-shrink-0">
                                        {conv.avatar ? <img src={conv.avatar} alt="" className="w-full h-full object-cover" /> : conv.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-gray-900 text-sm truncate">{conv.userName}</p>
                                            <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {conv.orderId && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                                                    {conv.orderId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-500 text-sm">No conversations found.</div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedConversation ? (
                    <div className="flex-1 flex flex-col bg-gray-50/30">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-upca-blue/10 overflow-hidden flex items-center justify-center text-upca-blue font-bold">
                                    {selectedConversation.avatar ? <img src={selectedConversation.avatar} alt="" className="w-full h-full object-cover" /> : selectedConversation.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedConversation.userName}</p>
                                    <p className="text-sm text-gray-500">{selectedConversation.userEmail || 'Active Client'}</p>
                                </div>
                                {selectedConversation.orderId && (
                                    <span className="ml-auto text-sm bg-white text-gray-600 px-3 py-1 rounded-full font-mono border border-gray-200">
                                        Order: {selectedConversation.orderId}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-md ${message.isAdmin ? 'order-2' : 'order-1'}`}>
                                        {!message.isAdmin && (
                                            <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">{message.senderName}</p>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-3 shadow-sm ${message.isAdmin
                                                ? 'bg-upca-blue text-white rounded-br-none'
                                                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 mt-1 px-2 ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-[10px] text-gray-400 font-medium">{formatTime(message.timestamp)}</span>
                                            {message.isAdmin && <CheckCheck className="w-3 h-3 text-upca-blue" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-upca-blue/5 focus:bg-white focus:border-upca-blue/30 outline-none transition-all"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-upca-blue text-white rounded-xl font-bold hover:bg-upca-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-upca-blue/20"
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50/30">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-200 border border-gray-50">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <p className="font-bold text-gray-900">Select a conversation</p>
                            <p className="text-sm text-gray-500 mt-1">Communicate with your clients in real-time</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
