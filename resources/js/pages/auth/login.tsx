import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
            <Head title="Log in" />
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
                        <Link href={register()}>
                            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                                Register
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Login Form */}
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12 lg:px-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Log in to your account
                                </h1>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Enter your email and password below to log in
                                </p>
                            </div>

                            <Form
                                {...AuthenticatedSessionController.store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                    maxLength={100}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
                                                />
                                                <InputError message={errors.email} className="mt-1" />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Password
                                                    </Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                                                            tabIndex={5}
                                                        >
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                    maxLength={50}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
                                                />
                                                <InputError message={errors.password} className="mt-1" />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                    className="border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
                                                />
                                                <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                                                    Remember me
                                                </Label>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && (
                                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                            )}
                                            Log in
                                        </Button>

                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Don't have an account?{' '}
                                                <TextLink 
                                                    href={register()} 
                                                    tabIndex={5}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                                                >
                                                    Sign up
                                                </TextLink>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </Form>

                            {status && (
                                <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                                    {status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
