import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy - Restyle" />
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
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        {/* Introduction */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Your Privacy Matters
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                At Restyle, we are committed to protecting your privacy and ensuring the security of your personal information. 
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                                sustainable fashion marketplace platform.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                We believe in transparency and giving you control over your data. This policy covers how we handle information 
                                across all our services, including wardrobe management, marketplace transactions, messaging, and community features.
                            </p>
                        </div>

                        {/* Privacy Principles */}
                        <div className="mb-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Shield className="mr-2 h-5 w-5 text-green-600" />
                                Our Privacy Principles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Secure</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Industry-standard encryption and security measures</p>
                                </div>
                                <div className="text-center">
                                    <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Transparent</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Clear information about data collection and use</p>
                                </div>
                                <div className="text-center">
                                    <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Controlled</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">You control your data and privacy settings</p>
                                </div>
                                <div className="text-center">
                                    <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Minimal</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">We collect only what's necessary for our services</p>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Sections */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    1. Information We Collect
                                </h2>
                                
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Information:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Name, email address, and password for account creation</p>
                                    <p>• Profile information (optional: bio, location, preferences)</p>
                                    <p>• Profile pictures and avatar images</p>
                                    <p>• Two-factor authentication settings</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Wardrobe Data:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Clothing items you add to your digital wardrobe</p>
                                    <p>• Item details (brand, size, color, condition, photos)</p>
                                    <p>• Wardrobe organization and categorization</p>
                                    <p>• Outfit combinations and styling preferences</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Marketplace Activity:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Items you list for sale or trade</p>
                                    <p>• Purchase and transaction history</p>
                                    <p>• Search queries and browsing behavior</p>
                                    <p>• Favorite items and wishlist data</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Communication Data:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Messages sent through our messaging system</p>
                                    <p>• Product inquiries and negotiations</p>
                                    <p>• Support tickets and feedback</p>
                                    <p>• Community interactions and reviews</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technical Information:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>• IP address, browser type, and device information</p>
                                    <p>• Usage analytics and performance data</p>
                                    <p>• Cookies and similar tracking technologies</p>
                                    <p>• App crash reports and error logs</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    2. How We Use Your Information
                                </h2>
                                
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Provision:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Provide and maintain your account and wardrobe management</p>
                                    <p>• Facilitate marketplace transactions and communications</p>
                                    <p>• Enable messaging between buyers and sellers</p>
                                    <p>• Process payments and manage transactions</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Platform Improvement:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Analyze usage patterns to improve our services</p>
                                    <p>• Develop new features for wardrobe and marketplace management</p>
                                    <p>• Optimize search results and recommendations</p>
                                    <p>• Enhance user experience and interface design</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Communication:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                    <p>• Send important account and transaction notifications</p>
                                    <p>• Provide customer support and respond to inquiries</p>
                                    <p>• Share updates about new features and sustainability initiatives</p>
                                    <p>• Send marketing communications (with your consent)</p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Security & Compliance:</h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>• Prevent fraud and ensure platform safety</p>
                                    <p>• Comply with legal obligations and regulations</p>
                                    <p>• Protect against unauthorized access and misuse</p>
                                    <p>• Maintain platform integrity and community guidelines</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    3. Information Sharing & Disclosure
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p><strong>We do not sell your personal information to third parties.</strong></p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Limited Sharing:</h3>
                                    <p>• <strong>Other Users:</strong> Profile information visible in marketplace and messaging</p>
                                    <p>• <strong>Service Providers:</strong> Trusted partners who help us operate our platform</p>
                                    <p>• <strong>Legal Requirements:</strong> When required by law or to protect rights</p>
                                    <p>• <strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Anonymized Data:</h3>
                                    <p>• We may share aggregated, anonymized data for research and analytics</p>
                                    <p>• This data cannot be used to identify individual users</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    4. Data Security
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Technical Safeguards:</h3>
                                    <p>• Encryption of data in transit and at rest</p>
                                    <p>• Secure servers with regular security updates</p>
                                    <p>• Multi-factor authentication options</p>
                                    <p>• Regular security audits and penetration testing</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Access Controls:</h3>
                                    <p>• Limited employee access to user data on a need-to-know basis</p>
                                    <p>• Regular staff training on data protection</p>
                                    <p>• Secure development practices and code reviews</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Incident Response:</h3>
                                    <p>• 24/7 monitoring for security threats</p>
                                    <p>• Rapid response procedures for data breaches</p>
                                    <p>• User notification in case of security incidents</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    5. Your Privacy Rights
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access & Control:</h3>
                                    <p>• <strong>View:</strong> Access your personal information through your account settings</p>
                                    <p>• <strong>Update:</strong> Modify your profile and preferences anytime</p>
                                    <p>• <strong>Delete:</strong> Request deletion of your account and associated data</p>
                                    <p>• <strong>Export:</strong> Download a copy of your data in a portable format</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Communication Preferences:</h3>
                                    <p>• Control marketing email notifications</p>
                                    <p>• Manage transaction and account alerts</p>
                                    <p>• Choose your privacy settings for profile visibility</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Data Processing:</h3>
                                    <p>• Object to certain types of data processing</p>
                                    <p>• Restrict processing in specific circumstances</p>
                                    <p>• Request correction of inaccurate information</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    6. Cookies & Tracking Technologies
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Essential Cookies:</h3>
                                    <p>• Authentication and login sessions</p>
                                    <p>• Shopping cart and transaction state</p>
                                    <p>• Security and fraud prevention</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Analytics Cookies:</h3>
                                    <p>• Understand how users interact with our platform</p>
                                    <p>• Improve performance and user experience</p>
                                    <p>• Generate anonymous usage statistics</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Preference Cookies:</h3>
                                    <p>• Remember your settings and preferences</p>
                                    <p>• Customize your experience on our platform</p>
                                    <p>• Maintain wardrobe organization preferences</p>
                                    
                                    <p className="mt-4"><strong>Cookie Control:</strong> You can manage cookie preferences through your browser settings or our cookie consent banner.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    7. Data Retention
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Retention Periods:</h3>
                                    <p>• <strong>Account Data:</strong> Retained while your account is active</p>
                                    <p>• <strong>Transaction Records:</strong> 7 years for tax and legal compliance</p>
                                    <p>• <strong>Messages:</strong> 2 years after last conversation activity</p>
                                    <p>• <strong>Wardrobe Data:</strong> Until you delete items or close your account</p>
                                    <p>• <strong>Analytics Data:</strong> Anonymized data retained for up to 3 years</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Deletion:</h3>
                                    <p>• Data is securely deleted when retention periods expire</p>
                                    <p>• Immediate deletion upon account closure request</p>
                                    <p>• Some data may be retained longer for legal compliance</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    8. International Data Transfers
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>Restyle is based in the Philippines, and your data is primarily processed there. However, we may use service providers in other countries.</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Safeguards:</h3>
                                    <p>• Standard contractual clauses for international transfers</p>
                                    <p>• Adequacy decisions for certain jurisdictions</p>
                                    <p>• Service providers must meet our security standards</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Your Rights:</h3>
                                    <p>• You have the same privacy rights regardless of data location</p>
                                    <p>• Contact us if you have concerns about international transfers</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    9. Children's Privacy
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>Restyle is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.</p>
                                    
                                    <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to remove such information from our systems.</p>
                                    
                                    <p>If you are between 13-17 years old, you must have parental consent to use our platform.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    10. Changes to This Policy
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Notification Methods:</h3>
                                    <p>• Email notification to your registered address</p>
                                    <p>• In-app notification when you next log in</p>
                                    <p>• Prominent notice on our platform</p>
                                    
                                    <p><strong>Continued Use:</strong> Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                    11. Contact Us
                                </h2>
                                <div className="text-gray-600 dark:text-gray-300 space-y-3">
                                    <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                        <p><strong>Privacy Officer</strong></p>
                                        <p>Email: privacy@restyle.com</p>
                                        <p>Support: Available through your account dashboard</p>
                                        <p>Response Time: We aim to respond within 24-48 hours</p>
                                    </div>
                                    
                                    <p><strong>Data Protection Rights:</strong> You can exercise your privacy rights through your account settings or by contacting our Privacy Officer directly.</p>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                This Privacy Policy is effective as of the date listed above and applies to all users of the Restyle platform.
                            </p>
                            <div className="mt-4 flex justify-center space-x-4">
                                <Link href="/">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        Back to Restyle
                                    </Button>
                                </Link>
                                <Link href="/terms-of-service">
                                    <Button variant="outline">
                                        Terms of Service
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
