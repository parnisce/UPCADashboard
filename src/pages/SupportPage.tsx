import React, { useState } from 'react';
import {
    Search,
    HelpCircle,
    CreditCard,
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    Send,
    Bot,
    User,
    Sparkles
} from 'lucide-react';
import { cn } from '../services/utils';

interface FAQItem {
    question: string;
    answer: string;
    category: 'Usage' | 'Billing' | 'Refunds';
}

const FAQS: FAQItem[] = [
    {
        category: 'Usage',
        question: 'How do I book a new photoshoot?',
        answer: 'You can book a new shoot by clicking the "New Order" button on your dashboard or by choosing a date directly in the "Bookings & Calendar" section. Follow the multi-step form to select your property, services, and preferred date.'
    },
    {
        category: 'Usage',
        question: 'Where can I download my photos and videos?',
        answer: 'Once your order is marked as "Delivered", head to the "Deliverables" page. You will see all your properties listed with links to download high-resolution photos, 4K videos, and copy your microsite URLs.'
    },
    {
        category: 'Billing',
        question: 'What payment methods do you accept?',
        answer: 'We use Stripe for secure payments and accept all major credit cards including Visa, Mastercard, and American Express. You can manage your cards in the "Billing" section under "Manage Payment Methods".'
    },
    {
        category: 'Billing',
        question: 'When will I be charged for my order?',
        answer: 'Orders are typically charged once the shoot is completed and the editing process begins. For agents with auto-billing active, the primary card on file will be charged automatically.'
    },
    {
        category: 'Refunds',
        question: 'What is your refund policy?',
        answer: 'If you need to cancel a shoot, please do so at least 24 hours in advance for a full refund. Cancellations made within 24 hours may be subject to a rescheduling fee. If you are unsatisfied with the quality of the deliverables, contact our support team for a free re-edit or partial refund.'
    }
];

export const SupportPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'All' | 'Usage' | 'Billing' | 'Refunds'>('All');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // Chatbot State
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hi! I am your UPCA Assistant, powered by GPT-4. How can I help you with your marketing dashboard today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const filteredFaqs = FAQS.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulated GPT Response (Integration bridge)
        setTimeout(() => {
            const botResponse = {
                role: 'bot',
                content: "I've analyzed your request. You can manage that directly in your Billing settings or by contacting our 24/7 concierge. Would you like me to guide you there?"
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Support & Concierge</h1>
                <p className="text-gray-500 mt-2 text-lg">We're here to help you dominate your local real estate market.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: FAQ Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Search help articles, billing rules..."
                            className="w-full pl-16 pr-6 py-6 bg-white border border-gray-100 rounded-[32px] shadow-sm focus:ring-4 focus:ring-upca-blue/10 outline-none transition-all text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {['All', 'Usage', 'Billing', 'Refunds'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat as any)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl font-bold transition-all",
                                    activeCategory === cat
                                        ? "bg-upca-blue text-white shadow-lg shadow-upca-blue/20"
                                        : "bg-white text-gray-500 border border-gray-100 hover:border-upca-blue/30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            faq.category === 'Usage' ? "bg-blue-50 text-blue-500" :
                                                faq.category === 'Billing' ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500"
                                        )}>
                                            {faq.category === 'Usage' ? <HelpCircle className="w-5 h-5" /> :
                                                faq.category === 'Billing' ? <CreditCard className="w-5 h-5" /> : <RefreshCcw className="w-5 h-5" />}
                                        </div>
                                        <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                                    </div>
                                    {expandedFaq === index ? <ChevronUp className="w-6 h-6 text-gray-300" /> : <ChevronDown className="w-6 h-6 text-gray-300" />}
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-8 pb-8 pt-2 text-gray-600 leading-relaxed text-lg border-t border-gray-50 animate-in slide-in-from-top-2">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: AI Chatbot */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[700px]">
                        {/* Chat Header */}
                        <div className="p-6 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-upca-blue to-upca-yellow flex items-center justify-center">
                                    <Bot className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">UPCA AI Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GPT-4 Active</span>
                                    </div>
                                </div>
                            </div>
                            <Sparkles className="w-5 h-5 text-upca-yellow" />
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        msg.role === 'bot' ? "bg-upca-blue/10 text-upca-blue" : "bg-gray-200 text-gray-500"
                                    )}>
                                        {msg.role === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-[24px] text-sm leading-relaxed",
                                        msg.role === 'bot' ? "bg-white text-gray-700 shadow-sm border border-gray-100" : "bg-upca-blue text-white font-medium"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-upca-blue/10 text-upca-blue flex items-center justify-center">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask anything..."
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-upca-blue/20 outline-none transition-all"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-upca-blue text-white rounded-xl flex items-center justify-center hover:bg-upca-blue/90 transition-all shadow-md shadow-upca-blue/10"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-widest">Powered by OpenAI ChatGPT API</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
