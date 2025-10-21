import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TestResult {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
    duration?: number;
    message?: string;
    file?: string;
}

interface TestSuite {
    name: string;
    tests: TestResult[];
    stats: {
        total: number;
        passed: number;
        failed: number;
        pending: number;
    };
}

export default function TestDashboard() {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentTest, setCurrentTest] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const runTests = async (suite: 'unit' | 'feature' | 'all') => {
        setIsRunning(true);
        setLogs([]);
        
        try {
            const response = await fetch('/api/run-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ suite }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'test_result') {
                                updateTestResults(data.result);
                            } else if (data.type === 'log') {
                                setLogs(prev => [...prev, data.message]);
                            } else if (data.type === 'current_test') {
                                setCurrentTest(data.test);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error running tests:', error);
            setLogs(prev => [...prev, `Error: ${error}`]);
        } finally {
            setIsRunning(false);
            setCurrentTest('');
        }
    };

    const updateTestResults = (result: any) => {
        setTestSuites(prev => {
            const existing = prev.find(s => s.name === result.suite);
            if (existing) {
                return prev.map(s => 
                    s.name === result.suite 
                        ? { ...s, tests: [...s.tests, result.test] }
                        : s
                );
            } else {
                return [...prev, {
                    name: result.suite,
                    tests: [result.test],
                    stats: { total: 0, passed: 0, failed: 0, pending: 0 }
                }];
            }
        });
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'passed':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running':
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'skipped':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: TestResult['status']) => {
        const variants: Record<TestResult['status'], any> = {
            passed: 'default',
            failed: 'destructive',
            running: 'secondary',
            pending: 'outline',
            skipped: 'secondary',
        };

        return (
            <Badge variant={variants[status]} className="capitalize">
                {status}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Test Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Test Dashboard</h1>
                            <p className="text-gray-600 mt-2">Run and monitor your PEST unit tests</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => runTests('unit')}
                                disabled={isRunning}
                                className="flex items-center gap-2"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Run Unit Tests
                            </Button>
                            <Button 
                                onClick={() => runTests('feature')}
                                disabled={isRunning}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Run Feature Tests
                            </Button>
                            <Button 
                                onClick={() => runTests('all')}
                                disabled={isRunning}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Run All Tests
                            </Button>
                        </div>
                    </div>

                    {/* Current Test Running */}
                    {currentTest && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                                    <span className="text-sm font-medium text-blue-900">
                                        Running: {currentTest}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="results" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="results">Test Results</TabsTrigger>
                            <TabsTrigger value="logs">Console Output</TabsTrigger>
                        </TabsList>

                        <TabsContent value="results" className="space-y-4">
                            {testSuites.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">No tests run yet. Click a button above to start testing.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                testSuites.map((suite) => (
                                    <Card key={suite.name}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{suite.name}</span>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">
                                                        Total: {suite.tests.length}
                                                    </Badge>
                                                    <Badge variant="default">
                                                        Passed: {suite.tests.filter(t => t.status === 'passed').length}
                                                    </Badge>
                                                    <Badge variant="destructive">
                                                        Failed: {suite.tests.filter(t => t.status === 'failed').length}
                                                    </Badge>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {suite.tests.map((test) => (
                                                    <div 
                                                        key={test.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {getStatusIcon(test.status)}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{test.name}</p>
                                                                {test.file && (
                                                                    <p className="text-xs text-gray-500">{test.file}</p>
                                                                )}
                                                                {test.message && (
                                                                    <p className="text-xs text-red-600 mt-1">{test.message}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {test.duration && (
                                                                <span className="text-xs text-gray-500">
                                                                    {test.duration.toFixed(2)}s
                                                                </span>
                                                            )}
                                                            {getStatusBadge(test.status)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="logs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Console Output</CardTitle>
                                    <CardDescription>Real-time test execution logs</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 h-96 overflow-y-auto">
                                        {logs.length === 0 ? (
                                            <p className="text-gray-500">No logs yet...</p>
                                        ) : (
                                            logs.map((log, index) => (
                                                <div key={index} className="mb-1">
                                                    {log}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}

