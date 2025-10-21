<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of conversations
     */
    public function index()
    {
        $conversations = Conversation::with(['user1', 'user2', 'product', 'latestMessage'])
            ->forUser(auth()->id())
            ->active()
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) {
                $otherUser = $conversation->otherUser(auth()->id());
                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                    ],
                    'product' => $conversation->product ? [
                        'id' => $conversation->product->id,
                        'title' => $conversation->product->title,
                        'price' => $conversation->product->price,
                        'images' => $conversation->product->images,
                    ] : null,
                    'subject' => $conversation->subject,
                    'last_message' => $conversation->latestMessage ? [
                        'message' => $conversation->latestMessage->message,
                        'sender_id' => $conversation->latestMessage->sender_id,
                        'created_at' => $conversation->latestMessage->created_at,
                    ] : null,
                    'unread_count' => $conversation->messages()
                        ->where('sender_id', '!=', auth()->id())
                        ->where('is_read', false)
                        ->count(),
                    'last_message_at' => $conversation->last_message_at,
                ];
            });

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Show a specific conversation
     */
    public function show(Conversation $conversation)
    {
        // Ensure user is part of this conversation
        if ($conversation->user1_id !== auth()->id() && $conversation->user2_id !== auth()->id()) {
            abort(403, 'Unauthorized access to conversation.');
        }

        $conversation->load(['user1', 'user2', 'product']);
        $otherUser = $conversation->otherUser(auth()->id());

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at,
                    'is_own' => $message->sender_id === auth()->id(),
                ];
            });

        // Mark all messages as read
        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return Inertia::render('messages/show', [
            'conversation' => [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'product' => $conversation->product ? [
                    'id' => $conversation->product->id,
                    'title' => $conversation->product->title,
                    'price' => $conversation->product->price,
                    'images' => $conversation->product->images,
                ] : null,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                ],
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Start a new conversation
     */
    public function start(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        $otherUserId = $request->user_id;
        $productId = $request->product_id;

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($otherUserId) {
            $query->where('user1_id', auth()->id())
                  ->where('user2_id', $otherUserId);
        })->orWhere(function ($query) use ($otherUserId) {
            $query->where('user1_id', $otherUserId)
                  ->where('user2_id', auth()->id());
        })->when($productId, function ($query) use ($productId) {
            $query->where('product_id', $productId);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user1_id' => auth()->id(),
                'user2_id' => $otherUserId,
                'product_id' => $productId,
                'subject' => $request->subject,
                'last_message_at' => now(),
                'is_active' => true,
            ]);
        }

        // Create the first message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'message' => $request->message,
        ]);

        // Update conversation's last message time
        $conversation->update(['last_message_at' => now()]);

        return redirect()->route('messages.show', $conversation)
            ->with('success', 'Message sent successfully!');
    }

    /**
     * Send a message in an existing conversation
     */
    public function store(Request $request, Conversation $conversation)
    {
        // Ensure user is part of this conversation
        if ($conversation->user1_id !== auth()->id() && $conversation->user2_id !== auth()->id()) {
            abort(403, 'Unauthorized access to conversation.');
        }

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'message' => $request->message,
        ]);

        // Update conversation's last message time
        $conversation->update(['last_message_at' => now()]);

        return redirect()->back()
            ->with('success', 'Message sent successfully!');
    }

    /**
     * Get conversation with a specific user about a product
     */
    public function getConversation(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $conversation = Conversation::where(function ($query) use ($request) {
            $query->where('user1_id', auth()->id())
                  ->where('user2_id', $request->user_id);
        })->orWhere(function ($query) use ($request) {
            $query->where('user1_id', $request->user_id)
                  ->where('user2_id', auth()->id());
        })->when($request->product_id, function ($query) use ($request) {
            $query->where('product_id', $request->product_id);
        })->first();

        if ($conversation) {
            return redirect()->route('messages.show', $conversation);
        }

        // If no conversation exists, create a new one and redirect to it
        $conversation = Conversation::create([
            'user1_id' => auth()->id(),
            'user2_id' => $request->user_id,
            'product_id' => $request->product_id,
            'subject' => $request->product_id ? 'Product Inquiry' : 'General Chat',
            'last_message_at' => now(),
            'is_active' => true,
        ]);

        return redirect()->route('messages.show', $conversation);
    }
}