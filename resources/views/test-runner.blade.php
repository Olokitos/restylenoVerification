<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>PEST Test Runner - ReStyle 6.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spinning {
            animation: spin 1s linear infinite;
        }
        .tab-btn.active {
            color: #4f46e5;
            border-color: #4f46e5;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        🧪 PEST Test Runner
                    </h1>
                    <p class="text-gray-600 mt-2">ReStyle 6.0 - Automated Unit & Integration Testing</p>
                </div>
                
                <div class="flex gap-3 flex-wrap">
                    <button onclick="runTests('unit')" 
                            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            id="unitBtn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Unit Tests
                    </button>
                    <button onclick="runTests('feature')" 
                            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            id="featureBtn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Feature Tests
                    </button>
                    <button onclick="runTests('all')" 
                            class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            id="allBtn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        All Tests
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="statsCards">
            <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">Total Tests</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1" id="totalTests">0</p>
                    </div>
                    <div class="bg-indigo-100 rounded-full p-3">
                        <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-green-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">Passed</p>
                        <p class="text-3xl font-bold text-green-600 mt-1" id="passedTests">0</p>
                    </div>
                    <div class="bg-green-100 rounded-full p-3">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-red-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">Failed</p>
                        <p class="text-3xl font-bold text-red-600 mt-1" id="failedTests">0</p>
                    </div>
                    <div class="bg-red-100 rounded-full p-3">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-md p-6 border border-blue-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">Duration</p>
                        <p class="text-3xl font-bold text-blue-600 mt-1" id="duration">0s</p>
                    </div>
                    <div class="bg-blue-100 rounded-full p-3">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div id="progressBar" class="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100 hidden">
            <div class="flex items-center gap-4 mb-3">
                <svg class="w-6 h-6 text-indigo-600 spinning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <p class="text-gray-700 font-medium" id="currentTest">Running tests...</p>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div id="progressBarFill" class="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
        </div>

        <!-- Test Results -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <!-- Tabs -->
            <div class="border-b border-gray-200">
                <div class="flex">
                    <button onclick="showTab('results')" 
                            class="tab-btn px-6 py-4 font-semibold text-indigo-600 border-b-2 border-indigo-600 hover:text-indigo-700 transition-colors active"
                            data-tab="results">
                        Test Results
                    </button>
                    <button onclick="showTab('console')" 
                            class="tab-btn px-6 py-4 font-semibold text-gray-600 border-b-2 border-transparent hover:text-indigo-600 hover:border-indigo-600 transition-colors"
                            data-tab="console">
                        Console Output
                    </button>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
                <!-- Results Tab -->
                <div id="resultsTab" class="tab-content">
                    <div id="testResults" class="space-y-2">
                        <div class="text-center py-12 text-gray-400">
                            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            <p class="text-lg">No tests run yet</p>
                            <p class="text-sm mt-2">Click a button above to start testing</p>
                        </div>
                    </div>
                </div>

                <!-- Console Tab -->
                <div id="consoleTab" class="tab-content hidden">
                    <div class="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto" id="consoleOutput">
                        <div class="text-gray-500">Console ready...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ asset('test-runner.html') }}"></script>
    <script>
        let testResults = [];
        let startTime = 0;

        function showTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
                btn.classList.add('text-gray-600', 'border-transparent');
            });
            const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
            activeBtn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            activeBtn.classList.remove('text-gray-600', 'border-transparent');

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tabName + 'Tab').classList.remove('hidden');
        }

        async function runTests(suite) {
            // Disable buttons
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
            
            // Reset
            testResults = [];
            startTime = Date.now();
            document.getElementById('testResults').innerHTML = '';
            document.getElementById('consoleOutput').innerHTML = '<div class="text-gray-500">Running tests...</div>';
            document.getElementById('progressBar').classList.remove('hidden');
            
            // Update stats
            updateStats();

            try {
                const response = await fetch('/api/run-tests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    },
                    body: JSON.stringify({ suite })
                });

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                handleTestData(data);
                            } catch (e) {
                                console.error('Parse error:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                addConsoleLog(`Error: ${error.message}`, 'error');
            } finally {
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                document.getElementById('progressBar').classList.add('hidden');
                updateDuration();
            }
        }

        function handleTestData(data) {
            switch (data.type) {
                case 'test_result':
                    addTestResult(data.result);
                    break;
                case 'log':
                    addConsoleLog(data.message);
                    break;
                case 'current_test':
                    document.getElementById('currentTest').textContent = `Running: ${data.test}`;
                    break;
                case 'complete':
                    addConsoleLog(data.exitCode === 0 ? '✓ All tests completed!' : '✗ Tests completed with errors', data.exitCode === 0 ? 'success' : 'error');
                    break;
            }
        }

        function addTestResult(result) {
            testResults.push(result.test);
            updateStats();
            
            const testDiv = document.createElement('div');
            testDiv.className = `flex items-center justify-between p-4 rounded-lg border transition-all ${
                result.test.status === 'passed' ? 'bg-green-50 border-green-200' :
                result.test.status === 'failed' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
            }`;
            
            testDiv.innerHTML = `
                <div class="flex items-center gap-3 flex-1">
                    ${getStatusIcon(result.test.status)}
                    <div class="flex-1">
                        <p class="font-medium text-sm">${escapeHtml(result.test.name)}</p>
                        ${result.test.file ? `<p class="text-xs text-gray-500">${escapeHtml(result.test.file)}</p>` : ''}
                        ${result.test.message ? `<p class="text-xs text-red-600 mt-1">${escapeHtml(result.test.message)}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${result.test.duration ? `<span class="text-xs text-gray-500">${result.test.duration.toFixed(2)}s</span>` : ''}
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        result.test.status === 'passed' ? 'bg-green-200 text-green-800' :
                        result.test.status === 'failed' ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-800'
                    }">
                        ${result.test.status.toUpperCase()}
                    </span>
                </div>
            `;
            
            document.getElementById('testResults').appendChild(testDiv);
        }

        function addConsoleLog(message, type = 'log') {
            const logDiv = document.createElement('div');
            logDiv.className = type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-gray-300';
            logDiv.textContent = message;
            
            const consoleOutput = document.getElementById('consoleOutput');
            consoleOutput.appendChild(logDiv);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }

        function updateStats() {
            const total = testResults.length;
            const passed = testResults.filter(t => t.status === 'passed').length;
            const failed = testResults.filter(t => t.status === 'failed').length;
            
            document.getElementById('totalTests').textContent = total;
            document.getElementById('passedTests').textContent = passed;
            document.getElementById('failedTests').textContent = failed;
            
            if (total > 0) {
                const progress = ((passed + failed) / total) * 100;
                document.getElementById('progressBarFill').style.width = progress + '%';
            }
        }

        function updateDuration() {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            document.getElementById('duration').textContent = duration + 's';
        }

        function getStatusIcon(status) {
            const icons = {
                passed: '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                failed: '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                running: '<svg class="w-5 h-5 text-blue-600 spinning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            };
            return icons[status] || icons.running;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>

