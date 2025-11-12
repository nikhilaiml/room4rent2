'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabaseClient } from '@/supabase';
import { useSupabase } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';

interface Message {
  id: string;
  enquiryId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface ChatComponentProps {
  enquiryId: string;
  currentUserId: string;
  otherUserId: string;
  onClose?: () => void;
}

export default function ChatComponent({ enquiryId, currentUserId, otherUserId, onClose }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { user } = useSupabase();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`messages:${enquiryId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `enquiryId=eq.${enquiryId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enquiryId, supabase]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('enquiryId', enquiryId)
        .order('createdAt', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          enquiryId,
          senderId: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-16 right-4 w-80 h-96 bg-white border rounded-lg shadow-lg flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-16 right-4 w-80 h-96 shadow-lg z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Chat</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    message.senderId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}