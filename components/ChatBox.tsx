"use client";

import { useState, useRef, useEffect } from "react";

export interface PalmAnalysis {
  dominant_mounts: string[];
  line_analysis: string;
  identified_yogs: string[];
  reading_summary: string;
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  translatedText?: string;
  isTranslating?: boolean;
}

export default function ChatBox({ analysis }: { analysis: PalmAnalysis | null }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: 'සාදරයෙන් පිළිගනිමු! (Welcome!) I have reviewed your palm lines. What would you like to know about your reading?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string = userInput) => {
    if (textToSend.trim() === '') return;

    const newMessages = [...messages, { id: Date.now(), sender: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          analysis: analysis, 
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
      } else if (response.status === 429) {
         alert("The spirits need a moment to rest. (Rate limit reached). Please wait 60 seconds and try again.");
         setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Rate limit reached. Please wait.' }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Sorry, the connection was lost.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateMessage = async (id: number, text: string) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTranslating: true } : msg));

    try {
      const response = await fetch("/api/translate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();

      if (response.ok && data.translatedText) {
        setMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, translatedText: data.translatedText, isTranslating: false } : msg
        ));
      } else if (response.status === 429) {
         alert("The spirits need a moment to rest. (Rate limit reached). Please wait 60 seconds and try again.");
         setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTranslating: false } : msg));
      } else {
         alert("Translation failed. Please try again.");
         setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTranslating: false } : msg));
      }
    } catch (error) {
       alert("Network connection error.");
       setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isTranslating: false } : msg));
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded-lg shadow-inner h-full flex flex-col p-4 m-6 lg:m-0 overflow-hidden">
      <div className="pb-4 border-b border-gray-200 mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Conversational Palmist</h3>
        <span className="text-xs text-green-600 font-medium">Online</span>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-thin flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col items-start max-w-[85%]">
                
                <div className={`p-3 rounded-lg text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-indigo-50 text-slate-900 border border-indigo-100 rounded-bl-none'
                }`}>
                  {msg.text}
                  
                  {msg.translatedText && (
                    <div className="mt-2 pt-2 border-t border-indigo-200 text-indigo-900 font-medium">
                        {msg.translatedText}
                    </div>
                  )}
                </div>
                
                {msg.sender === 'ai' && !msg.translatedText && (
                    <button 
                        onClick={() => handleTranslateMessage(msg.id, msg.text)}
                        disabled={msg.isTranslating}
                        className="text-[10px] text-gray-500 mt-1 ml-1 hover:text-indigo-600 font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {msg.isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                )}

            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-500 rounded-bl-none text-xs italic">Consulting the charts...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="py-3 flex flex-wrap gap-2 text-xs text-gray-600 mt-auto">
        <button onClick={() => handleSendMessage("Tell me more about my dominant mounts.")} className="border rounded-full px-3 py-1 hover:bg-gray-50">Mounts?</button>
        <button onClick={() => handleSendMessage("වෘත්තීය පලාපල ගැන කියන්න (Career predictions?)")} className="border rounded-full px-3 py-1 hover:bg-gray-50">Career?</button>
      </div>

      <div className="border-t border-gray-200 pt-3 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(userInput)}
          placeholder="Ask a question... (ඔබේ ප්‍රශ්නය අසන්න...)"
          disabled={isLoading}
          className="flex-grow p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 disabled:bg-gray-50"
        />
        <button
          onClick={() => handleSendMessage(userInput)}
          disabled={isLoading || !userInput.trim()}
          className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:bg-indigo-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}