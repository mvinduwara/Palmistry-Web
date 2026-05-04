"use client";

import { useState } from "react";

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatBox({ analysis }: { analysis: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: 'සාදරයෙන් පිළිගනිමු! (Welcome!) I have reviewed your palm lines. What would you like to know about your reading?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Sorry, the connection was lost.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
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
            <div className={`p-3 rounded-lg max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-500 rounded-bl-none text-xs italic">Consulting the charts...</div>
          </div>
        )}
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