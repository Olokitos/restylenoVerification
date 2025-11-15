<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     * Email verification is disabled - always redirect to dashboard.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        // Auto-verify user if not already verified (email verification disabled)
        if (!$request->user()->hasVerifiedEmail()) {
            $request->user()->email_verified_at = now();
            $request->user()->save();
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
