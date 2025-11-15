# 💬 Real-Time Chat Implementation

## Overview

Real-time chat functionality has been implemented using **polling** (checking for new messages every 2 seconds). This approach doesn't require external services like Pusher or WebSockets, making it simple to deploy and maintain.

## Features

✅ **Real-time message updates** - New messages appear automatically without page refresh  
✅ **AJAX message sending** - Messages are sent without page reload  
✅ **Auto-scroll** - Chat automatically scrolls to latest messages  
✅ **Read receipts** - Messages are marked as read when received  
✅ **Performance optimized** - Polling stops when page is hidden  
✅ **Visual indicator** - "Live" badge shows when chat is active  

## How It Works

### Backend Changes

1. **New API Endpoint** (`/messages/{conversation}/new`)
   - Returns new messages since the last message ID
   - Automatically marks received messages as read
   - Returns JSON response for AJAX requests

2. **Updated Message Store Method**
   - Returns JSON response when sending via AJAX
   - Falls back to redirect for non-AJAX requests

### Frontend Changes

1. **Polling Mechanism**
   - Checks for new messages every 2 seconds
   - Only polls when page is visible (stops when tab is hidden)
   - Automatically updates message list when new messages arrive

2. **AJAX Message Sending**
   - Messages are sent via fetch API
   - Immediately adds sent message to UI
   - Falls back to Inertia form submission if AJAX fails

3. **State Management**
   - Messages stored in React state
   - Tracks last message ID for efficient polling
   - Auto-scrolls to bottom when new messages arrive

## API Endpoints

### Get New Messages
```
GET /messages/{conversation}/new?last_message_id={id}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 123,
      "message": "Hello!",
      "sender_id": 1,
      "sender_name": "John Doe",
      "is_read": true,
      "created_at": "2025-11-15T12:00:00.000000Z",
      "is_own": false
    }
  ],
  "last_message_id": 123
}
```

### Send Message (AJAX)
```
POST /messages/{conversation}
Content-Type: application/json
X-Requested-With: XMLHttpRequest

{
  "message": "Hello!"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 124,
    "message": "Hello!",
    "sender_id": 2,
    "sender_name": "Jane Doe",
    "is_read": false,
    "created_at": "2025-11-15T12:01:00.000000Z",
    "is_own": true
  }
}
```

## Configuration

### Polling Interval

The polling interval is set to **2 seconds** by default. To change it, modify the interval in `resources/js/pages/messages/show.tsx`:

```typescript
pollingIntervalRef.current = setInterval(fetchNewMessages, 2000); // 2000ms = 2 seconds
```

### Performance Considerations

- Polling automatically stops when the page/tab is hidden
- Only fetches messages newer than the last known message ID
- Efficient database queries using indexed message IDs

## Future Enhancements

For even better real-time performance, consider upgrading to:

1. **Laravel Broadcasting + Pusher**
   - True WebSocket connections
   - Instant message delivery
   - Better for high-traffic applications

2. **Laravel Echo + Redis**
   - Server-sent events
   - Lower latency than polling
   - Good middle ground

3. **WebSocket Server (Laravel Reverb)**
   - Native Laravel WebSocket support
   - No external dependencies
   - Best performance

## Testing

To test the real-time functionality:

1. Open the chat in two different browser windows (or incognito windows)
2. Log in as different users
3. Send messages from one window
4. Messages should appear in the other window within 2 seconds without refresh

## Troubleshooting

### Messages not updating?

1. Check browser console for errors
2. Verify the API endpoint is accessible: `/messages/{conversation}/new`
3. Check network tab to see if polling requests are being made
4. Verify CSRF token is present in the page

### Messages not sending?

1. Check if CSRF token is present in meta tag
2. Verify AJAX request headers include `X-Requested-With: XMLHttpRequest`
3. Check browser console for errors
4. System will fallback to form submission if AJAX fails

## Files Modified

- `app/Http/Controllers/MessageController.php` - Added `getNewMessages()` and AJAX support
- `routes/web.php` - Added new route for fetching messages
- `resources/js/pages/messages/show.tsx` - Added polling and AJAX functionality

## Notes

- Polling interval of 2 seconds provides good balance between responsiveness and server load
- System gracefully falls back to traditional form submission if AJAX fails
- Messages are automatically marked as read when received via polling
- Chat stops polling when page is hidden to save resources

