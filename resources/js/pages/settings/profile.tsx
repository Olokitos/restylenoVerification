import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import { User, Mail, Lock, Shield, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Save, Key, UserCheck, Palette, Globe, ArrowLeft, Settings, Edit3, Upload, Image as ImageIcon, CreditCard, Send, LoaderCircle } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/settings/profile';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Profile',
        href: edit().url,
    },
];

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
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Requirements</p>
            </div>
            <div className="space-y-2">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        {req.met ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${req.met ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
            {allMet && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Password meets all requirements!
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
        auth.user.profile_picture ? `/storage/${auth.user.profile_picture}` : null
    );
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type (only PNG and JPEG)
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload only PNG or JPEG images.');
                e.target.value = '';
                return;
            }

            // Validate file size (max 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                alert('File size must be less than 2MB.');
                e.target.value = '';
                return;
            }

            // Validate dimensions using Image object
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                
                // Check minimum dimensions
                if (img.width < 100 || img.height < 100) {
                    alert('Image must be at least 100x100 pixels.');
                    e.target.value = '';
                    return;
                }
                
                // Check maximum dimensions
                if (img.width > 5000 || img.height > 5000) {
                    alert('Image must not exceed 5000x5000 pixels.');
                    e.target.value = '';
                    return;
                }
                
                setProfilePicture(file);
                
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfilePicturePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                alert('Invalid image file.');
                e.target.value = '';
            };
            
            img.src = objectUrl;
        }
    };

    const handleAppearance = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.get(editAppearance().url);
    };

    const handleLanguageRegion = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to language & region settings (placeholder for now)
        alert('Language & Region Settings\n\nThis feature is coming soon! You will be able to change your language preference and regional settings here.');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Profile" />

            <SettingsLayout>
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href={dashboard()}
                                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Dashboard</span>
                            </Link>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Manage your personal information, secure your account, and customize your Restyle experience. 
                            Keep your profile up-to-date for the best sustainable fashion journey.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Account Status</div>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {auth.user.email_verified_at ? 'Verified' : 'Pending'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Email Status</div>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Member</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Since Today</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Information Card */}
                    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-gray-900 dark:text-white">Personal Information</CardTitle>
                                    <CardDescription>Update your name and email address</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-6"
                            >
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Full Name
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="name"
                                                        className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                                                        defaultValue={auth.user.name}
                                                        name="name"
                                                        required
                                                        autoComplete="name"
                                                        placeholder="Enter your full name"
                                                        maxLength={100}
                                                    />
                                                </div>
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                                                        defaultValue={auth.user.email}
                                                        name="email"
                                                        required
                                                        autoComplete="username"
                                                        placeholder="Enter your email address"
                                                        maxLength={100}
                                                        onKeyPress={(e) => {
                                                            // Only allow letters (a-z, A-Z), numbers (0-9), @, and .
                                                            if (!/[a-zA-Z0-9@.]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            // Remove any characters that are not letters, numbers, @, or .
                                                            const value = e.target.value.replace(/[^a-zA-Z0-9@.]/g, '');
                                                            e.target.value = value;
                                                        }}
                                                    />
                                                </div>
                                                <InputError message={errors.email} />
                                            </div>
                                        </div>

                                        {/* Payment Method / GCash Section - Users can see their own info */}
                                        <div className="space-y-2">
                                            <Label htmlFor="gcash_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                GCash Number
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="gcash_number"
                                                    name="gcash_number"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    pattern="[0-9]{11,13}"
                                                    className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                                                    defaultValue={auth.user.gcash_number || ''}
                                                    placeholder="09XXXXXXXXX"
                                                    maxLength={13}
                                                    minLength={11}
                                                    onKeyPress={(e) => {
                                                        // Only allow numeric characters (0-9)
                                                        if (!/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        // Remove any non-numeric characters
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        e.target.value = value;
                                                    }}
                                                />
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <CreditCard className="h-4 w-4" />
                                                </span>
                                            </div>
                                            <InputError message={errors.gcash_number} />
                                            <div className="text-xs text-gray-600 dark:text-gray-400 pt-1">
                                                Enter your GCash mobile number for payouts. For PH numbers only. Example: 09171234567
                                            </div>
                                        </div>

                                        {/* Bank Information Section - Users can see their own info */}
                                        <div className="space-y-4 border-t pt-6 mt-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Bank Information for Payouts
                                                    </Label>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Secure payment details for receiving payouts
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="bank_name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                                                        <span>Bank Name</span>
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="bank_name"
                                                        name="bank_name"
                                                        type="text"
                                                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                                                        defaultValue={auth.user.bank_name || ''}
                                                        placeholder="e.g., BPI, BDO, RCBC, Metrobank"
                                                        maxLength={100}
                                                        onKeyPress={(e) => {
                                                            // Only allow letters, spaces, and common bank name characters
                                                            if (!/[a-zA-Z0-9\s-]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            // Remove any characters that are not letters, numbers, spaces, or hyphens
                                                            const value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                                                            e.target.value = value;
                                                        }}
                                                    />
                                                    <InputError message={errors.bank_name} />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Enter the full name of your bank
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bank_account_number" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                                                        <span>Account Number</span>
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="bank_account_number"
                                                        name="bank_account_number"
                                                        type="text"
                                                        inputMode="numeric"
                                                        className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 font-mono"
                                                        defaultValue={auth.user.bank_account_number || ''}
                                                        placeholder="Enter account number (numbers only)"
                                                        maxLength={50}
                                                        onKeyPress={(e) => {
                                                            // Only allow numeric characters (0-9)
                                                            if (!/[0-9]/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            // Remove any non-numeric characters
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            e.target.value = value;
                                                        }}
                                                    />
                                                    <InputError message={errors.bank_account_number} />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Enter your bank account number (numbers only)
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                                                    <span>Account Name</span>
                                                    <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="bank_account_name"
                                                    name="bank_account_name"
                                                    type="text"
                                                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                                                    defaultValue={auth.user.bank_account_name || ''}
                                                    placeholder="Name as it appears on your bank account"
                                                    maxLength={100}
                                                    onKeyPress={(e) => {
                                                        // Only allow letters, spaces, apostrophes, hyphens, and periods
                                                        if (!/[a-zA-Z\s'-.]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        // Remove any characters that are not letters, spaces, apostrophes, hyphens, or periods
                                                        const value = e.target.value.replace(/[^a-zA-Z\s'-.]/g, '');
                                                        e.target.value = value;
                                                    }}
                                                />
                                                <InputError message={errors.bank_account_name} />
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Enter the exact name as it appears on your bank account
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-start space-x-2">
                                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-blue-800 dark:text-blue-200">
                                                        <p className="font-medium mb-1">Security Notice</p>
                                                        <p className="text-blue-600 dark:text-blue-300">
                                                            Your bank information is encrypted and securely stored. This information is only visible to you and administrators for payout processing purposes.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Picture Upload */}
                                        <div className="space-y-2">
                                            <Label htmlFor="profile_picture" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Profile Picture
                                            </Label>
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    {profilePicturePreview ? (
                                                        <div className="relative">
                                                            <img 
                                                                src={profilePicturePreview} 
                                                                alt="Profile preview" 
                                                                className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
                                                            />
                                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                                                <CheckCircle className="h-4 w-4 text-white" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                                            <User className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="relative">
                                                        <input
                                                            ref={fileInputRef}
                                                            id="profile_picture"
                                                            name="profile_picture"
                                                            type="file"
                                                            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Choose Image
                                                        </Button>
                                                    </div>
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                        <div className="flex items-start space-x-2">
                                                            <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                                                <p className="font-medium">Accepted formats: PNG, JPEG only</p>
                                                                <p className="text-blue-600 dark:text-blue-300">File size: Maximum 2MB</p>
                                                                <p className="text-blue-600 dark:text-blue-300">Dimensions: 100x100 - 5000x5000 pixels</p>
                                                                <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">Image will be automatically optimized and resized for best performance.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {profilePicture && (
                                                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{profilePicture.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <InputError message={errors.profile_picture} />
                                        </div>

                                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                                            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                            Verify Your Email Address
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                            To ensure the security of your account and access all features, please verify your email address. 
                                                            We'll send a verification link to <span className="font-medium text-gray-900 dark:text-white">{auth.user.email}</span>.
                                                        </p>
                                                        {status === 'verification-link-sent' ? (
                                                            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                                                                <div className="flex items-center space-x-3">
                                                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                            Verification email sent successfully!
                                                                        </p>
                                                                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                                            Please check your inbox and click the verification link. If you don't see it, check your spam folder.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                                <div className="flex items-start space-x-3">
                                                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                                                        Your email address is not verified. Click the button below to receive a verification link.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <Form
                                                            {...EmailVerificationNotificationController.store.form()}
                                                            className="inline-block"
                                                        >
                                                            {({ processing }) => (
                                                                <Button
                                                                    type="submit"
                                                                    disabled={processing}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2.5 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {processing ? (
                                                                        <>
                                                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                                            Sending...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Send className="mr-2 h-4 w-4" />
                                                                            {status === 'verification-link-sent' ? 'Resend Verification Email' : 'Send Verification Email'}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-11"
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Profile updated successfully!</span>
                                                </div>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Password Update Card */}
                    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-gray-900 dark:text-white">Security Settings</CardTitle>
                                    <CardDescription>Update your password to keep your account secure</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Form
                                {...PasswordController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                resetOnError={['password', 'password_confirmation', 'current_password']}
                                resetOnSuccess
                                onError={(errors) => {
                                    if (errors.password) {
                                        passwordInput.current?.focus();
                                    }
                                    if (errors.current_password) {
                                        currentPasswordInput.current?.focus();
                                    }
                                }}
                                className="space-y-6"
                            >
                                {({ errors, processing, recentlySuccessful }) => (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Current Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="current_password"
                                                    ref={currentPasswordInput}
                                                    name="current_password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                                    autoComplete="current-password"
                                                    placeholder="Enter your current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.current_password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="password"
                                                    ref={passwordInput}
                                                    name="password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                                                    autoComplete="new-password"
                                                    placeholder="Enter your new password"
                                                    maxLength={50}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <PasswordComplexity password={newPassword} />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Confirm New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className={`pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 ${
                                                        confirmPassword && newPassword !== confirmPassword 
                                                            ? 'border-red-300 dark:border-red-600' 
                                                            : confirmPassword && newPassword === confirmPassword 
                                                            ? 'border-green-300 dark:border-green-600' 
                                                            : ''
                                                    }`}
                                                    autoComplete="new-password"
                                                    placeholder="Confirm your new password"
                                                    maxLength={50}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">Passwords do not match</span>
                                                </div>
                                            )}
                                            {confirmPassword && newPassword === confirmPassword && (
                                                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm">Passwords match</span>
                                                </div>
                                            )}
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-password-button"
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-11"
                                            >
                                                <Key className="mr-2 h-4 w-4" />
                                                {processing ? 'Updating...' : 'Update Password'}
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Password updated successfully!</span>
                                                </div>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Additional Settings Cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Account Status Card */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Account Status</CardTitle>
                                        <CardDescription>Your account information</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Email Verification</span>
                                    <Badge variant={auth.user.email_verified_at ? "default" : "destructive"}>
                                        {auth.user.email_verified_at ? "Verified" : "Pending"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                                    <Badge variant="secondary">Free</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                                    <span className="text-sm text-gray-900 dark:text-white">Today</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                                        <CardDescription>Manage your account</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                    onClick={handleAppearance}
                                >
                                    <Palette className="mr-2 h-4 w-4" />
                                    Appearance
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                    onClick={handleLanguageRegion}
                                >
                                    <Globe className="mr-2 h-4 w-4" />
                                    Language & Region
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Delete Account Card */}
                    <Card className="border-red-200 dark:border-red-800 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-red-900 dark:text-red-100">Danger Zone</CardTitle>
                                    <CardDescription className="text-red-700 dark:text-red-300">
                                        Permanently delete your account and all associated data
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DeleteUser />
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}