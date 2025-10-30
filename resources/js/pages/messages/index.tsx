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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/50 dark:via-emerald-950/30 dark:to-teal-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <p className="text-gray-600 dark:text-gray-400">Chat with buyers and sellers</p>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button className="border-green-200 bg-white/60 hover:bg-white/80 text-gray-900 dark:text-white dark:bg-gray-800/60 dark:hover:bg-gray-800/80 rounded-xl px-4 py-2 transition-all duration-200">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-800/60 border border-green-200 dark:border-green-800 rounded-2xl p-12 text-center">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Start a conversation by clicking "Chat Seller" on any product in the marketplace.
              </p>
              <Link href="/marketplace">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 py-3 transition-all duration-200">
                  Browse Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="relative bg-white/70 dark:bg-gray-800/60 border border-green-200 dark:border-green-800 rounded-2xl p-5 hover:shadow-md transition-all duration-200"
                >
                  <Link href={`/messages/${conversation.id}`}>
                    <div className="flex items-start space-x-4">
                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Conversation Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {conversation.other_user.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTime(conversation.last_message_at)}
                            </span>
                            {conversation.unread_count > 0 && (
                              <div className="px-2 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        {conversation.product && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              About: {conversation.product.title}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {formatPrice(conversation.product.price)}
                            </span>
                          </div>
                        )}

                        {/* Subject */}
                        {conversation.subject && (
                          <div className="mb-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {conversation.subject}
                            </span>
                          </div>
                        )}

                        {/* Last Message */}
                        {conversation.last_message && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                            <span className={conversation.last_message.sender_id !== conversation.other_user.id ? 'font-medium text-gray-900 dark:text-white' : ''}>
                              {conversation.last_message.sender_id === conversation.other_user.id ? '' : 'You: '}
                            </span>
                            {truncateMessage(conversation.last_message.message)}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
