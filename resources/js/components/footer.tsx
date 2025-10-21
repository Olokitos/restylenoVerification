import { Link } from '@inertiajs/react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-green-400">
                                Restyle
                            </span>
                        </Link>
                        <p className="text-gray-300 text-sm">
                            Transform your wardrobe, reduce waste, and discover sustainable fashion. 
                            Join our community in making fashion more sustainable.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/marketplace" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/wardrobe" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Wardrobe
                                </Link>
                            </li>
                            <li>
                                <Link href="/messages" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Messages
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop-profile" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Shop Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Safety Guidelines
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Community Guidelines
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-green-400" />
                                <span className="text-gray-300 text-sm">Restyle@gmail.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-green-400" />
                                <span className="text-gray-300 text-sm">(+63) 9761083939</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-green-400" />
                                <span className="text-gray-300 text-sm">Lapu-Lapu City</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <span>© 2025 Restyle. Made with</span>
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>for sustainable fashion.</span>
                    </div>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy-policy" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-service" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                            Terms of Service
                        </Link>
                        <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
