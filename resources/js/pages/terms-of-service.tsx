import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Users, Heart, Recycle } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function TermsOfService() {
    return (
        <>
            <Head title="Terms of Service - Restyle" />
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
                        <Link href="/">
                            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        {/* Introduction */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Welcome to Restyle
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                These Terms of Service ("Terms") govern your use of Restyle, our sustainable fashion marketplace platform. 
                                By accessing or using our services, you agree to be bound by these Terms.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Restyle is committed to promoting sustainable fashion, reducing waste, and building a community 
                                that values circular economy principles. Our platform connects fashion enthusiasts who want to 
                                buy, sell, and trade pre-loved clothing items.
                            </p>
                        </div>

                        {/* Key Principles */}
                        <div className="mb-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Heart className="mr-2 h-5 w-5 text-green-600" />
                                Our Core Values
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <Recycle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Sustainability</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Promoting circular fashion and reducing textile waste</p>
                                </div>
                                <div className="text-center">
                                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Trust & Safety</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Secure transactions and authentic item listings</p>
                                </div>
                                <div className="text-center">
                                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Community</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Building connections through sustainable fashion</p>
                                </div>
                            </div>
                        </div>

                        {/* Terms Sections */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    1. Account Registration
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• You must be at least 18 years old to create an account on Restyle</p>
                                    <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                                    <p>• You agree to provide accurate and complete information during registration</p>
                                    <p>• You are responsible for all activities that occur under your account</p>
                                    <p>• You must notify us immediately of any unauthorized use of your account</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    2. Marketplace Guidelines
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Allowed Items:</h3>
                                    <p>• Pre-loved clothing, shoes, and fashion accessories</p>
                                    <p>• Items in good condition (gently used, like new, or new with tags)</p>
                                    <p>• Authentic branded items with proper documentation</p>
                                    <p>• Items that align with sustainable fashion principles</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">Prohibited Items:</h3>
                                    <p>• Counterfeit or replica items</p>
                                    <p>• Items in poor condition (stained, torn, or damaged beyond normal wear)</p>
                                    <p>• Items that violate intellectual property rights</p>
                                    <p>• Items that promote discrimination, violence, or illegal activities</p>
                                    <p>• Items that are not fashion-related</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    3. Transactions & Payments
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• All transactions are conducted directly between buyers and sellers</p>
                                    <p>• Restyle facilitates connections but is not a party to individual transactions</p>
                                    <p>• Sellers are responsible for accurately describing their items</p>
                                    <p>• Buyers should verify item details before completing purchases</p>
                                    <p>• We recommend using secure payment methods and keeping transaction records</p>
                                    <p>• All prices are displayed in Philippine Pesos (₱) unless otherwise specified</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    4. User Conduct
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• Be respectful and courteous in all interactions</p>
                                    <p>• Provide honest and accurate information about items you're selling</p>
                                    <p>• Respond promptly to messages and inquiries</p>
                                    <p>• Honor your commitments and complete transactions as agreed</p>
                                    <p>• Report any suspicious or inappropriate behavior</p>
                                    <p>• Do not spam, harass, or engage in fraudulent activities</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    5. Privacy & Data Protection
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• We collect and process your data in accordance with our Privacy Policy</p>
                                    <p>• Your personal information is protected using industry-standard security measures</p>
                                    <p>• We may use your data to improve our services and user experience</p>
                                    <p>• You can update or delete your account information at any time</p>
                                    <p>• We do not sell your personal data to third parties</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    6. Dispute Resolution
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• We encourage users to resolve disputes directly through communication</p>
                                    <p>• Restyle may assist in dispute resolution but is not obligated to do so</p>
                                    <p>• For serious violations, we may suspend or terminate accounts</p>
                                    <p>• Users agree to resolve disputes through binding arbitration when applicable</p>
                                    <p>• We reserve the right to remove listings that violate our guidelines</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    7. Intellectual Property
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• Users retain ownership of their content and listings</p>
                                    <p>• By posting content, you grant Restyle a license to display and distribute it</p>
                                    <p>• You must have the right to sell any items you list</p>
                                    <p>• Respect intellectual property rights of others</p>
                                    <p>• Report any copyright or trademark violations</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    8. Service Availability
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• We strive to maintain 24/7 service availability but cannot guarantee uninterrupted access</p>
                                    <p>• We may perform maintenance that temporarily affects service availability</p>
                                    <p>• We reserve the right to modify or discontinue features with notice</p>
                                    <p>• Users are responsible for backing up their important data</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    9. Limitation of Liability
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• Restyle is a marketplace platform connecting buyers and sellers</p>
                                    <p>• We are not responsible for the quality, authenticity, or delivery of items</p>
                                    <p>• Users transact at their own risk</p>
                                    <p>• Our liability is limited to the maximum extent permitted by law</p>
                                    <p>• We recommend using secure payment methods and shipping with insurance</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    10. Changes to Terms
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>• We may update these Terms from time to time</p>
                                    <p>• Users will be notified of significant changes via email or platform notification</p>
                                    <p>• Continued use of the service constitutes acceptance of updated Terms</p>
                                    <p>• If you disagree with changes, you may terminate your account</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    11. Contact Information
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>For questions about these Terms of Service, please contact us:</p>
                                    <p>• Email: legal@restyle.com</p>
                                    <p>• Support Center: Available through your account dashboard</p>
                                    <p>• Response time: We aim to respond within 24-48 hours</p>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                By using Restyle, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                            </p>
                            <div className="mt-4">
                                <Link href="/">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        Back to Restyle
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
