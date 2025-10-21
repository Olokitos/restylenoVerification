import { router } from '@inertiajs/react';

// Store the last valid authenticated route
let lastAuthenticatedRoute = '/dashboard';

// Track if user is authenticated
let isAuthenticated = false;

// Update authentication status
export function updateAuthStatus(authenticated: boolean) {
    isAuthenticated = authenticated;
}

// Update last authenticated route
export function updateLastAuthenticatedRoute(route: string) {
    if (isAuthenticated && route !== '/login') {
        lastAuthenticatedRoute = route;
    }
}

// Navigation guard middleware
export function setupNavigationGuard() {
    // Listen for Inertia navigation events
    router.on('start', (event) => {
        const url = new URL(event.detail.visit.url, window.location.origin);
        const pathname = url.pathname;
        
        // If authenticated user tries to visit login page, redirect to appropriate dashboard
        if (isAuthenticated && pathname === '/login') {
            event.detail.visit.cancel();
            // For admin users, redirect to admin dashboard if no last route or if last route was regular dashboard
            const redirectPath = lastAuthenticatedRoute === '/dashboard' ? '/admin/dashboard' : lastAuthenticatedRoute;
            router.visit(redirectPath, {
                method: 'get',
                replace: true,
            });
            return;
        }
        
        // Update last authenticated route if navigating to a protected route
        if (isAuthenticated && pathname !== '/login') {
            lastAuthenticatedRoute = pathname;
        }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        // Small delay to ensure URL has updated
        setTimeout(() => {
            const currentPath = window.location.pathname;
            
            if (isAuthenticated && currentPath === '/login') {
                // For admin users, redirect to admin dashboard if no last route or if last route was regular dashboard
                const redirectPath = lastAuthenticatedRoute === '/dashboard' ? '/admin/dashboard' : lastAuthenticatedRoute;
                router.visit(redirectPath, {
                    method: 'get',
                    replace: true,
                });
            }
        }, 0);
    });
}
