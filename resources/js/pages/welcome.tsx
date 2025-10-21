import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
                {/* Navigation */}
                <nav className="flex items-center justify-between p-6 lg:px-8">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                Restyle
                            </span>
                        </Link>
                    </div>
                    <div className="flex lg:flex-1 lg:justify-end space-x-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Register
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
                        <div className="text-center">
                            {/* Main Header */}
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                                Wear More, Waste Less.
                            </h1>
                            
                            {/* Subheading */}
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl lg:text-2xl max-w-2xl mx-auto">
                                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link href="/register">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="#learn-more" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    Learn more <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learn More Section */}
                <div id="learn-more" className="py-24 sm:py-32 bg-white dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                                Transform Your Wardrobe
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Discover sustainable fashion solutions that help you make the most of your existing wardrobe while reducing waste.
                            </p>
                        </div>
                        
                        {/* Features Grid */}
                        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Secure Trading</h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Safe and secure platform for buying and selling pre-loved fashion items.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Sustainable Fashion</h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Reduce waste and promote circular fashion through our community marketplace.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Community Driven</h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Join a community of fashion enthusiasts committed to sustainable practices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}