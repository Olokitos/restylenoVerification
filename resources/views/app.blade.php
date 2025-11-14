<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html, body {
                background-color: #ffffff !important;
                color: #000000 !important;
                margin: 0;
                padding: 0;
                min-height: 100vh;
            }

            html.dark, html.dark body {
                background-color: #0f0f23 !important;
                color: #ffffff !important;
            }
            
            /* Ensure content is visible */
            #app {
                background-color: inherit !important;
                color: inherit !important;
                min-height: 100vh;
            }
        </style>

        <title inertia>{{ config('app.name', 'ReStyle') }}</title>

        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico?v=3" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
        
        <!-- Fallback CSS to ensure content is visible -->
        <style>
            /* Fallback styles in case main CSS doesn't load */
            .fallback-content {
                background: white;
                color: black;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            .fallback-content h1 {
                color: #333;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
