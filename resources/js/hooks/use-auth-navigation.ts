import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { updateAuthStatus, updateLastAuthenticatedRoute } from '../middleware/navigation-guard';

// Force rebuild

export function useAuthNavigation() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        // Update authentication status in the navigation guard
        updateAuthStatus(!!auth.user);
        
        // Update last authenticated route if user is authenticated
        if (auth.user) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                updateLastAuthenticatedRoute(currentPath);
            }
        }
    }, [auth.user]);

    // Handle navigation away from login page for authenticated users
    useEffect(() => {
        if (auth.user && window.location.pathname === '/login') {
            // Redirect admin users to admin dashboard, regular users to dashboard
            const redirectPath = auth.user.is_admin ? '/admin/dashboard' : '/dashboard';
            router.visit(redirectPath, {
                method: 'get',
                replace: true,
            });
        }
    }, [auth.user]);
}
