'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEmpatheticResponse, getTextToSpeech } from '@/app/actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
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
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getEmpatheticResponse({ userInput: currentInput });
      const aiText = aiResponse.response;
      
      const speechResponse = await getTextToSpeech({ text: aiText });

      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        audioUrl: speechResponse.media,
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm here to listen. Could you tell me more?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-full max-w-md bg-[#111827] rounded-xl p-4 shadow-2xl text-white">
        {companionImage && (
            <Image
                src={companionImage.imageUrl}
                alt={companionImage.description}
                data-ai-hint={companionImage.imageHint}
                width={320}
                height={180}
                className="w-full h-44 object-cover rounded-lg mb-3"
            />
        )}
        <h3 className="text-xl font-bold font-headline">Empathetic AI Companion</h3>
        <p className="text-sm text-gray-400 mb-3">Talk to a supportive AI friend who listens and understands.</p>
        
        <div ref={chatBoxRef} className="mt-3 h-52 overflow-y-auto bg-[#020617] p-2.5 rounded-lg flex flex-col gap-2">
            {messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">How are you feeling today?</p>
                </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'p-2 rounded-lg max-w-[90%] text-sm flex items-start gap-2',
                  message.sender === 'user' ? 'bg-[#1d4ed8] self-end' : 'bg-[#334155] self-start'
                )}
              >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.sender === 'ai' && message.audioUrl && (
                    <button
                      className="text-gray-300 hover:text-white transition-colors"
                      onClick={() => playAudio(message.audioUrl!)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
              </div>
            ))}
             {isLoading && (
              <div className="bg-[#334155] self-start p-2 rounded-lg flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2 mt-2">
          <Input
            id="userInput"
            placeholder="Type how you feel..."
            className="flex-1 bg-white text-black border-none"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
