import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/price';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Package, 
  Clock,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Message {
  id: number;
  message: string;
  sender_id: number;
  sender_name: string;
  is_read: boolean;
  created_at: string;
  is_own: boolean;
}

interface Conversation {
  id: number;
  subject?: string;
  product?: {
    id: number;
    title: string;
    price: number;
    images: string[];
  };
  other_user: {
    id: number;
    name: string;
  };
}

interface MessagesShowProps {
  conversation: Conversation;
  messages: Message[];
}

export default function MessagesShow({ conversation, messages: initialMessages }: MessagesShowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [lastMessageId, setLastMessageId] = useState<number>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].id : 0
  );
  const [isPolling, setIsPolling] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data, setData, post, processing, errors } = useForm({
    message: '',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Set up polling
  useEffect(() => {
    if (!isPolling || !conversation.id) return;

    const fetchNewMessages = async () => {
      try {
        const response = await fetch(`/messages/${conversation.id}/new?last_message_id=${lastMessageId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.messages.length > 0) {
            setMessages(prev => [...prev, ...result.messages]);
            setLastMessageId(result.last_message_id);
            scrollToBottom();
          }
        }
      } catch (error) {
        console.error('Error fetching new messages:', error);
      }
    };

    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(fetchNewMessages, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, lastMessageId, conversation.id]);

  // Stop polling when user leaves the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.message.trim() || processing) return;

    try {
      const response = await fetch(`/messages/${conversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ message: data.message.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.message) {
          // Add the new message to the list
          setMessages(prev => [...prev, result.message]);
          setLastMessageId(result.message.id);
          setData('message', '');
          scrollToBottom();
        }
      } else {
        // Fallback to Inertia form submission if AJAX fails
        post(`/messages/${conversation.id}`, {
          onSuccess: () => {
            setData('message', '');
            scrollToBottom();
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to Inertia form submission
      post(`/messages/${conversation.id}`, {
        onSuccess: () => {
          setData('message', '');
          scrollToBottom();
        }
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <AppLayout>
      <Head title={`Chat with ${conversation.other_user.name}`} />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/30 dark:to-teal-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/messages">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {conversation.other_user.name}
                  </h1>
                  {isPolling && (
                    <span className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span>Live</span>
                    </span>
                  )}
                </div>
                {conversation.subject && (
                  <p className="text-gray-600 dark:text-gray-400">{conversation.subject}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Product Info Sidebar */}
            {conversation.product && (
              <div className="lg:col-span-1">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Product Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {conversation.product.images && conversation.product.images.length > 0 ? (
                          <img 
                            src={`/storage/${conversation.product.images[0]}`} 
                            alt={conversation.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {conversation.product.title}
                        </h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPrice(conversation.product.price)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Link 
                          href={`/marketplace/${conversation.product.id}`}
                          className="w-full"
                        >
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            View Product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Chat Area */}
            <div className={conversation.product ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Card className="border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <Badge variant="outline" className="text-xs">
                                {formatDate(message.created_at)}
                              </Badge>
                            </div>
                          )}
                          
                          <div className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.is_own 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                message.is_own ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <span>{formatTime(message.created_at)}</span>
                                {message.is_own && (
                                  <span>{message.is_read ? '✓✓' : '✓'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={processing}
                    />
                    <Button 
                      type="submit" 
                      disabled={processing || !data.message.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  {errors.message && (
                    <p className="text-sm text-red-600 mt-2">{errors.message}</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
