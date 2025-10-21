<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raw HTML Test</title>
    <style>
        body {
            background-color: white;
            color: black;
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
        }
        .test-box {
            background-color: #f0f0f0;
            border: 2px solid #333;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .success {
            background-color: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }
        .error {
            background-color: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
    </style>
</head>
<body>
    <h1 style="color: blue; font-size: 32px;">Raw HTML Test</h1>
    
    <div class="test-box success">
        <h2>✅ Raw HTML is Working!</h2>
        <p>If you can see this, the basic HTML rendering is working.</p>
        <p><strong>Timestamp:</strong> {{ now() }}</p>
        <p><strong>Laravel Version:</strong> {{ app()->version() }}</p>
    </div>
    
    <div class="test-box">
        <h2>System Status</h2>
        <p><strong>Database Connection:</strong> 
            @try
                {{ DB::connection()->getPdo() ? '✅ Connected' : '❌ Failed' }}
            @catch(Exception $exception)
                ❌ Error: {{ $exception->getMessage() }}
            @endtry
        </p>
        <p><strong>User Count:</strong> {{ \App\Models\User::count() }}</p>
        <p><strong>Product Count:</strong> {{ \App\Models\Product::count() }}</p>
    </div>
    
    <div class="test-box">
        <h2>Navigation Tests</h2>
        <a href="/simple-test" style="display: inline-block; margin: 5px; padding: 10px; background: blue; color: white; text-decoration: none; border-radius: 5px;">API Test</a>
        <a href="/ultra-simple" style="display: inline-block; margin: 5px; padding: 10px; background: green; color: white; text-decoration: none; border-radius: 5px;">Inertia Test</a>
        <a href="/" style="display: inline-block; margin: 5px; padding: 10px; background: purple; color: white; text-decoration: none; border-radius: 5px;">Home</a>
    </div>
    
    <div class="test-box">
        <h2>Diagnostic Information</h2>
        <p><strong>PHP Version:</strong> {{ PHP_VERSION }}</p>
        <p><strong>Server:</strong> {{ request()->server('SERVER_SOFTWARE') }}</p>
        <p><strong>Request URL:</strong> {{ request()->fullUrl() }}</p>
        <p><strong>Environment:</strong> {{ app()->environment() }}</p>
    </div>
</body>
</html>
