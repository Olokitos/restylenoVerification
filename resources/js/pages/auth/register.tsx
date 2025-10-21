import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Password complexity validation component
function PasswordComplexity({ password }: { password: string }) {
    const requirements = [
        { text: 'At least 8 characters', met: password.length >= 8 },
        { text: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
        { text: 'At least one lowercase letter', met: /[a-z]/.test(password) },
        { text: 'At least one number', met: /\d/.test(password) },
        { text: 'At least one special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
    ];

    const allMet = requirements.every(req => req.met);

    return (
        <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">Password requirements:</p>
            {requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                    {req.met ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {req.text}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function Register() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                {/* Navigation */}
                <nav className="flex items-center justify-between p-6 lg:px-8">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                Restyle
                            </span>
                        </Link>
                    </div>
                    <div className="flex lg:flex-1 lg:justify-end">
                        <Link href={login()}>
                            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                                Log in
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Register Form */}
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12 lg:px-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Create an account
                                </h1>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Enter your details below to create your account
                                </p>
                            </div>

                            <Form
                                {...RegisteredUserController.store.form()}
                                resetOnSuccess={['password', 'password_confirmation']}
                                disableWhileProcessing
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    name="name"
                                                    placeholder="Full name"
                                                    maxLength={100}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
                                                />
                                                <InputError
                                                    message={errors.name}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder="email@example.com"
                                                    maxLength={100}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
                                                />
                                                <InputError message={errors.email} className="mt-1" />
                                            </div>

                                            <div>
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Password
                                                </Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    tabIndex={3}
                                                    autoComplete="new-password"
                                                    name="password"
                                                    placeholder="Password"
                                                    maxLength={50}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
                                                />
                                                <PasswordComplexity password={password} />
                                                <InputError message={errors.password} className="mt-1" />
                                            </div>

                                            <div>
                                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Confirm password
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    required
                                                    tabIndex={4}
                                                    autoComplete="new-password"
                                                    name="password_confirmation"
                                                    placeholder="Confirm password"
                                                    maxLength={50}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={`mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500 ${
                                                        confirmPassword && password !== confirmPassword 
                                                            ? 'border-red-300 dark:border-red-600' 
                                                            : confirmPassword && password === confirmPassword 
                                                            ? 'border-green-300 dark:border-green-600' 
                                                            : ''
                                                    }`}
                                                />
                                                {confirmPassword && password !== confirmPassword && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                        Passwords do not match
                                                    </p>
                                                )}
                                                {confirmPassword && password === confirmPassword && (
                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Passwords match
                                                    </p>
                                                )}
                                                <InputError
                                                    message={errors.password_confirmation}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                            tabIndex={5}
                                            data-test="register-user-button"
                                        >
                                            {processing && (
                                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                            )}
                                            Create account
                                        </Button>

                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Already have an account?{' '}
                                                <TextLink 
                                                    href={login()} 
                                                    tabIndex={6}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                                                >
                                                    Log in
                                                </TextLink>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
