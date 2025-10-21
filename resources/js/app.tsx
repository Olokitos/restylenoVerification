import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { setupNavigationGuard, updateAuthStatus, updateLastAuthenticatedRoute } from './middleware/navigation-guard';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Setup navigation guard
        setupNavigationGuard();

        // Create a wrapper component that manages auth state
        const AppWithGuard = () => {
            const { auth } = props.initialPage.props as any;
            
            // Update authentication status
            updateAuthStatus(!!auth.user);
            
            // Update last authenticated route if user is authenticated
            if (auth.user) {
                const currentPath = window.location.pathname;
                if (currentPath !== '/login') {
                    updateLastAuthenticatedRoute(currentPath);
                }
            }

            return <App {...props} />;
        };

        root.render(<AppWithGuard />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
