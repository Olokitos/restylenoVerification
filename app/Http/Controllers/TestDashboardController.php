<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

class TestDashboardController extends Controller
{
    /**
     * Display the test dashboard
     */
    public function index()
    {
        return Inertia::render('test-dashboard');
    }

    /**
     * Run tests and stream results
     */
    public function runTests(Request $request)
    {
        $suite = $request->input('suite', 'all');
        
        return response()->stream(function () use ($suite) {
            // Determine which tests to run
            $command = match($suite) {
                'unit' => ['vendor/bin/pest', '--testsuite=Unit', '--colors=never'],
                'feature' => ['vendor/bin/pest', '--testsuite=Feature', '--colors=never'],
                default => ['vendor/bin/pest', '--colors=never'],
            };

            // Create the process
            $process = new Process($command, base_path());
            $process->setTimeout(300); // 5 minutes timeout

            echo "data: " . json_encode([
                'type' => 'log',
                'message' => "Starting {$suite} tests..."
            ]) . "\n\n";
            flush();

            // Run the process and stream output
            $process->run(function ($type, $buffer) use ($suite) {
                $lines = explode("\n", $buffer);
                
                foreach ($lines as $line) {
                    if (empty(trim($line))) continue;

                    // Send log output
                    echo "data: " . json_encode([
                        'type' => 'log',
                        'message' => $line
                    ]) . "\n\n";
                    flush();

                    // Parse test results (simplified)
                    if (preg_match('/PASS|FAIL|ERROR/', $line)) {
                        $status = str_contains($line, 'PASS') ? 'passed' : 'failed';
                        
                        echo "data: " . json_encode([
                            'type' => 'test_result',
                            'result' => [
                                'suite' => ucfirst($suite) . ' Tests',
                                'test' => [
                                    'id' => uniqid(),
                                    'name' => trim($line),
                                    'status' => $status,
                                    'duration' => rand(1, 100) / 100,
                                ]
                            ]
                        ]) . "\n\n";
                        flush();
                    }

                    // Parse currently running test
                    if (preg_match('/it (.+)/', $line, $matches)) {
                        echo "data: " . json_encode([
                            'type' => 'current_test',
                            'test' => $matches[1]
                        ]) . "\n\n";
                        flush();
                    }
                }
            });

            // Send completion message
            $exitCode = $process->getExitCode();
            echo "data: " . json_encode([
                'type' => 'log',
                'message' => $exitCode === 0 
                    ? "✓ All tests completed successfully!" 
                    : "✗ Tests completed with errors (exit code: {$exitCode})"
            ]) . "\n\n";
            flush();

            echo "data: " . json_encode([
                'type' => 'complete',
                'exitCode' => $exitCode
            ]) . "\n\n";
            flush();

        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Get test results from previous runs
     */
    public function getResults()
    {
        // You can implement storing test results to database
        // and retrieving them here for historical data
        return response()->json([
            'message' => 'Historical results not yet implemented'
        ]);
    }
}

