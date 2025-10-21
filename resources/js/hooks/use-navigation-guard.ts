import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function useNavigationGuard() {
    const { auth } = usePage<SharedData>().props;
    const isRedirecting = useRef(false);

    useEffect(() => {
        // Only apply the guard if user is authenticated
        if (!auth.user) {
            return;
        }

        const currentUrl = window.location.pathname;
        
        // If authenticated user is on login page, redirect to appropriate dashboard
        if (currentUrl === '/login' && auth.user && !isRedirecting.current) {
            isRedirecting.current = true;
            const redirectPath = auth.user.is_admin ? '/admin/dashboard' : '/dashboard';
            router.visit(redirectPath, {
                method: 'get',
                replace: true, // Replace current history entry instead of adding new one
                onFinish: () => {
                    isRedirecting.current = false;
                }
            });
        }
    }, [auth.user]);

    useEffect(() => {
        if (!auth.user) {
            return;
        }

        const handlePopState = (event: PopStateEvent) => {
            // Small delay to ensure the URL has updated
            setTimeout(() => {
                const currentUrl = window.location.pathname;
                
                if (currentUrl === '/login' && auth.user && !isRedirecting.current) {
                    isRedirecting.current = true;
                    const redirectPath = auth.user.is_admin ? '/admin/dashboard' : '/dashboard';
                    router.visit(redirectPath, {
                        method: 'get',
                        replace: true,
                        onFinish: () => {
                            isRedirecting.current = false;
                        }
                    });
                }
            }, 0);
        };

        // Listen for browser back/forward button
        window.addEventListener('popstate', handlePopState);

        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [auth.user]);
}
