import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/price';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  User,
  Package,
  ArrowRight
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Conversation {
  id: number;
  other_user: {
    id: number;
    name: string;
  };
  product?: {
    id: number;
    title: string;
    price: number;
    images: string[];
  };
  subject?: string;
  last_message?: {
    message: string;
    sender_id: number;
    created_at: string;
  };
  unread_count: number;
  last_message_at: string;
}

interface MessagesIndexProps {
  conversations: Conversation[];
}

export default function MessagesIndex({ conversations }: MessagesIndexProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...' 
      : message;
  };

  return (
    <AppLayout>
      <Head title="Messages" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
        <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-8">
          {/* Modern Header */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Communication Hub</p>
                <p className="text-white font-semibold">Messages</p>
              </div>
            </div>
          </div>

          {/* Modern Page Title */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
              <MessageCircle className="h-6 w-6 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Messages</h1>
            </div>
            <p className="text-lg text-white/70 max-w-4xl mx-auto leading-relaxed">
              Connect with other users, discuss products, and build meaningful relationships through our messaging system.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Start a conversation by clicking "Chat Seller" on any product in the marketplace.
              </p>
              <Link href="/marketplace">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 rounded-xl px-8 py-3 transition-all duration-300 hover:scale-105">
                  Browse Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <Link href={`/messages/${conversation.id}`}>
                    <div className="flex items-start space-x-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Conversation Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors">
                            {conversation.other_user.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-white/60">
                              {formatTime(conversation.last_message_at)}
                            </span>
                            {conversation.unread_count > 0 && (
                              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        {conversation.product && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4 text-white/60" />
                            <span className="text-sm text-white/70">
                              About: {conversation.product.title}
                            </span>
                                <span className="text-sm font-medium text-green-400">
                                    {formatPrice(conversation.product.price)}
                                </span>
                          </div>
                        )}

                        {/* Subject */}
                        {conversation.subject && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white/80 border border-white/30">
                              {conversation.subject}
                            </span>
                          </div>
                        )}

                        {/* Last Message */}
                        {conversation.last_message && (
                          <p className="text-white/70 text-sm line-clamp-2">
                            <span className={conversation.last_message.sender_id !== conversation.other_user.id ? 'font-medium text-white' : ''}>
                              {conversation.last_message.sender_id === conversation.other_user.id ? '' : 'You: '}
                            </span>
                            {truncateMessage(conversation.last_message.message)}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-pink-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
