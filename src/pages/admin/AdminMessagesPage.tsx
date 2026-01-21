import { useState } from 'react';
import { Send, Search, MessageSquare, CheckCheck } from 'lucide-react';
import type { Message } from '../../types';

interface Conversation {
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    orderId?: string;
}

export const AdminMessagesPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            userId: '1',
            userName: 'Sarah Johnson',
            userEmail: 'sarah.johnson@remax.com',
            lastMessage: 'When will the photos be ready?',
            lastMessageTime: '2026-01-21T10:30:00',
            unreadCount: 2,
            orderId: 'ORD-001'
        },
        {
            userId: '2',
            userName: 'Michael Chen',
            userEmail: 'mchen@coldwellbanker.com',
            lastMessage: 'Thanks for the quick turnaround!',
            lastMessageTime: '2026-01-21T09:15:00',
            unreadCount: 0,
            orderId: 'ORD-003'
        },
        {
            userId: '3',
            userName: 'Emily Rodriguez',
            userEmail: 'emily.r@century21.com',
            lastMessage: 'Can we reschedule the shoot?',
            lastMessageTime: '2026-01-20T16:45:00',
            unreadCount: 1,
            orderId: 'ORD-005'
        }
    ]);

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            orderId: 'ORD-001',
            senderId: '1',
            senderName: 'Sarah Johnson',
            content: 'Hi, I just placed an order for photography at 123 Main Street. When can we schedule the shoot?',
            timestamp: '2026-01-21T09:00:00',
            isAdmin: false
        },
        {
            id: '2',
            orderId: 'ORD-001',
            senderId: 'admin',
            senderName: 'UPCA Admin',
            content: 'Hello Sarah! Thank you for your order. We have availability this Thursday or Friday. Which works better for you?',
            timestamp: '2026-01-21T09:15:00',
            isAdmin: true
        },
        {
            id: '3',
            orderId: 'ORD-001',
            senderId: '1',
            senderName: 'Sarah Johnson',
            content: 'Thursday at 10 AM would be perfect!',
            timestamp: '2026-01-21T09:30:00',
            isAdmin: false
        },
        {
            id: '4',
            orderId: 'ORD-001',
            senderId: 'admin',
            senderName: 'UPCA Admin',
            content: 'Great! I\'ve scheduled your shoot for Thursday, January 23rd at 10:00 AM. Our photographer will arrive 5-10 minutes early.',
            timestamp: '2026-01-21T09:35:00',
            isAdmin: true
        },
        {
            id: '5',
            orderId: 'ORD-001',
            senderId: '1',
            senderName: 'Sarah Johnson',
            content: 'When will the photos be ready?',
            timestamp: '2026-01-21T10:30:00',
            isAdmin: false
        }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv =>
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            orderId: selectedConversation.orderId,
            senderId: 'admin',
            senderName: 'UPCA Admin',
            content: newMessage,
            timestamp: new Date().toISOString(),
            isAdmin: true
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // Update conversation last message
        setConversations(conversations.map(conv =>
            conv.userId === selectedConversation.userId
                ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date().toISOString() }
                : conv
        ));
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
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.userId}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedConversation?.userId === conv.userId
                                    ? 'bg-upca-blue/5 border-l-4 border-l-upca-blue'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-upca-blue/10 flex items-center justify-center text-upca-blue font-bold flex-shrink-0">
                                        {conv.userName.charAt(0)}
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
                                            {conv.unreadCount > 0 && (
                                                <span className="text-xs bg-upca-blue text-white px-2 py-0.5 rounded-full font-bold">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedConversation ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-upca-blue/10 flex items-center justify-center text-upca-blue font-bold">
                                    {selectedConversation.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{selectedConversation.userName}</p>
                                    <p className="text-sm text-gray-500">{selectedConversation.userEmail}</p>
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
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${message.isAdmin
                                                ? 'bg-upca-blue text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 mt-1 px-2 ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                                            {message.isAdmin && <CheckCheck className="w-3 h-3 text-gray-400" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-upca-blue/20 focus:border-upca-blue outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-upca-blue text-white rounded-xl font-semibold hover:bg-upca-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
