<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class NotificationService
{
    /**
     * Create a notification for a user
     */
    public static function create(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?Model $notifiable = null,
        ?array $data = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'notifiable_type' => $notifiable ? get_class($notifiable) : null,
            'notifiable_id' => $notifiable?->id,
            'data' => $data,
        ]);
    }

    /**
     * Create transaction notification
     */
    public static function transaction(
        User $user,
        string $title,
        string $message,
        Model $transaction,
        ?string $actionUrl = null
    ): Notification {
        return self::create(
            $user,
            'transaction',
            $title,
            $message,
            $actionUrl ?? "/transactions/{$transaction->id}",
            $transaction
        );
    }

    /**
     * Create message notification
     */
    public static function message(
        User $user,
        string $title,
        string $message,
        Model $conversation,
        ?string $actionUrl = null
    ): Notification {
        return self::create(
            $user,
            'message',
            $title,
            $message,
            $actionUrl ?? "/messages/{$conversation->id}",
            $conversation
        );
    }

    /**
     * Create rating notification
     */
    public static function rating(
        User $user,
        string $title,
        string $message,
        Model $rating,
        ?string $actionUrl = null
    ): Notification {
        return self::create(
            $user,
            'rating',
            $title,
            $message,
            $actionUrl,
            $rating
        );
    }

    /**
     * Create system notification
     */
    public static function system(
        User $user,
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?array $data = null
    ): Notification {
        return self::create(
            $user,
            'system',
            $title,
            $message,
            $actionUrl,
            null,
            $data
        );
    }
}
