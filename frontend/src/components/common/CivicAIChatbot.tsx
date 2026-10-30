import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface Message {
  role: 'bot' | 'user';
  text: string;
  action?: {
    label: string;
    path: string;
  };
}

export const CivicAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Namaskara! I am your CivicAI Assistant for Bengaluru. How can I assist you with municipal grievances, ward questions, or complaint tracking today?'
    }
  ]);
  const [thinking, setThinking] = useState(false);
  const navigate = useNavigate();

  const quickPrompts = [
    'How do I report a dangerous pothole?',
    'Track my complaint status',
    'Report garbage dump in my ward',
    'What does priority level mean?'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setThinking(true);

    try {
      const data = await apiClient.chat(text);
      setMessages([...newMessages, { role: 'bot', text: data.reply, action: data.action }]);
    } catch {
      // Fallback if offline
      const lower = text.toLowerCase();
      let botResponse = '';
      let action: { label: string; path: string } | undefined;

      if (lower.includes('pothole') || lower.includes('road') || lower.includes('crater')) {
        botResponse = 'Road potholes are categorized under Roads & Infrastructure. You can submit an issue with photos and GPS location; Gemini will assess its safety risk and route it to BBMP Major Roads division.';
        action = { label: 'Go to Report Form', path: '/submit' };
      } else if (lower.includes('track') || lower.includes('status') || lower.includes('blr-')) {
        botResponse = 'You can track the live progression of any complaint (Submitted → Assigned → In Progress → Resolved) by entering your Reference ID.';
        action = { label: 'Open Tracking Portal', path: '/track' };
      } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash')) {
        botResponse = 'Solid Waste Management complaints are assigned to the local Ward Junior Health Inspector (JHI) with a standard 24-hour turnaround.';
        action = { label: 'Report Waste Issue', path: '/submit' };
      } else if (lower.includes('priority')) {
        botResponse = 'CivicAI uses an explainable priority model: Critical (immediate physical/life hazard), High (school/hospital proximity or traffic corridor), Medium (standard SLA), and Low (minor maintenance).';
      } else {
        botResponse = `I have logged your query regarding "${text}". You can submit a formal grievance, view public complaints on the map, or explore hotspot clusters in your ward.`;
        action = { label: 'Explore Civic Map', path: '/public-map' };
      }

      setMessages([...newMessages, { role: 'bot', text: botResponse, action }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-[#087F8C] hover:bg-[#06636D] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#102E50] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#087F8C] flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">CivicAI Assistant</h3>
                  <p className="text-[10px] text-teal-300 font-medium">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-[#087F8C] text-white flex items-center justify-center shrink-0 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#102E50] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.action && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(m.action.path);
                        }}
                        className="mt-2 inline-flex items-center px-2.5 py-1 bg-teal-50 text-[#087F8C] hover:bg-teal-100 rounded text-[11px] font-semibold border border-teal-200"
                      >
                        <span>{m.action.label}</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {thinking && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-white p-2.5 rounded-lg border border-slate-200 max-w-[50%]">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask a question or describe an issue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#087F8C]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-[#087F8C] hover:bg-[#06636D] text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
