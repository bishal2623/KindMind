'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEmpatheticResponse } from '@/app/actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface CompanionClientPageProps {
    companionImage: ImagePlaceholder | undefined;
}

export default function CompanionClientPage({ companionImage }: CompanionClientPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const aiResponse = await getEmpatheticResponse({ userInput: currentInput, history });
      const aiText = aiResponse.response;
      
      const newAiMessage: Message = {
        role: 'model',
        text: aiText,
      };
      setMessages((prev) => [...prev, newAiMessage]);

    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        role: 'model',
        text: "I'm here with you. Tell me more.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-md bg-[#111827] rounded-2xl p-4 shadow-2xl text-white">
        {companionImage && (
            <Image
                src={companionImage.imageUrl}
                alt={companionImage.description}
                data-ai-hint={companionImage.imageHint}
                width={380}
                height={190}
                className="w-full h-[190px] object-cover rounded-xl mb-3"
            />
        )}
        <h3 className="text-xl font-bold font-headline mt-3">Empathetic AI Companion</h3>
        <p className="text-sm text-gray-400 mb-3">Talk to an AI that listens, remembers, and responds like ChatGPT.</p>
        
        <div ref={chatBoxRef} className="mt-3 h-64 overflow-y-auto bg-[#020617] p-2.5 rounded-xl flex flex-col gap-2">
            {messages.length === 0 && !isLoading && (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">Share what’s on your mind…</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'p-2 px-2.5 rounded-lg max-w-[90%] text-sm whitespace-pre-wrap',
                  message.role === 'user' ? 'bg-[#2563eb] self-end' : 'bg-[#334155] self-start'
                )}
              >
                  <p>{message.text}</p>
              </div>
            ))}
             {isLoading && (
              <div className="bg-[#334155] self-start p-2 px-2.5 rounded-lg flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Typing…</span>
              </div>
            )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex flex-col w-full mt-2">
          <Input
            id="userInput"
            placeholder="Share what’s on your mind…"
            className="flex-1 bg-white text-black border-none rounded-lg p-2.5"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="lg" disabled={isLoading || !input.trim()} className="bg-[#38bdf8] hover:bg-[#0ea5e9] font-bold mt-2 rounded-lg text-base">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
