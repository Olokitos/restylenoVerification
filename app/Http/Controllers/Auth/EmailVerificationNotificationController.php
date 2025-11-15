<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     * Email verification is disabled - this method does nothing.
     */
    public function store(Request $request): RedirectResponse
    {
        // Email verification disabled - auto-verify users instead
        if (!$request->user()->hasVerifiedEmail()) {
            $request->user()->email_verified_at = now();
            $request->user()->save();
        }

        return back()->with('status', 'verification-link-sent');
    }
}
