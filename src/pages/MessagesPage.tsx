import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '../services/utils';
import { api } from '../services/api';
import type { Message, User as UserType } from '../types';

export const MessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        api.getCurrentUser().then(setCurrentUser);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const fetchMessages = async () => {
            try {
                const data = await api.getMessagesByUser(currentUser.id);
                setMessages(data);
                scrollToBottom();
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUser) return;

        setIsSending(true);
        try {
            await api.sendMessage(input);
            setInput('');
            // Refresh messages immediately
            const data = await api.getMessagesByUser(currentUser.id);
            setMessages(data);
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-screen-xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Direct Messages</h1>
                <p className="text-gray-500 mt-1">Chat directly with the UPCA management and support team.</p>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden flex flex-col flex-1">
                {/* Chat Header */}
                <div className="p-6 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-upca-blue to-upca-yellow flex items-center justify-center">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">UPCA Concierge</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online & Responsive</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-upca-yellow" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">Typical reply: &lt; 15 mins</span>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 text-gray-200 border border-gray-50">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No message history yet</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Send us a message about an order, billing, or general feedback. We're here to help you dominate your market!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex flex-col gap-1 max-w-[80%] sm:max-w-[70%]",
                                msg.isAdmin ? "mr-auto" : "ml-auto items-end"
                            )}>
                                <div className={cn(
                                    "flex items-center gap-2 mb-1",
                                    msg.isAdmin ? "flex-row" : "flex-row-reverse"
                                )}>
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                                        msg.isAdmin ? "bg-upca-blue/10 text-upca-blue" : "bg-gray-200 text-gray-500"
                                    )}>
                                        {msg.isAdmin ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{msg.senderName}</span>
                                </div>
                                <div className={cn(
                                    "p-4 rounded-[28px] text-sm leading-relaxed shadow-sm",
                                    msg.isAdmin
                                        ? "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                                        : "bg-upca-blue text-white font-medium rounded-tr-none"
                                )}>
                                    {msg.content}
                                    {msg.orderId && (
                                        <div className={cn(
                                            "mt-2 pt-2 border-t text-[10px] font-black uppercase tracking-wider",
                                            msg.isAdmin ? "border-gray-100 text-gray-400" : "border-white/20 text-white/60"
                                        )}>
                                            Ref: {msg.orderId}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold px-3 uppercase tracking-tighter opacity-70">
                                    {formatTime(msg.timestamp)}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Type a message to our team..."
                            className="w-full pl-6 pr-16 py-5 bg-gray-50 border-none rounded-[24px] focus:ring-4 focus:ring-upca-blue/5 focus:bg-white transition-all outline-none text-gray-700"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-upca-blue text-white rounded-[18px] flex items-center justify-center hover:bg-upca-blue/90 active:scale-95 transition-all shadow-lg shadow-upca-blue/20 disabled:opacity-50"
                        >
                            {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
