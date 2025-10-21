import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeft, 
    Users, 
    Mail, 
    Calendar, 
    Shield, 
    Edit3, 
    Trash2,
    Key,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface UserShowProps {
    user: User;
}

export default function UserShow({ user }: UserShowProps) {
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        router.post(`/admin/users/${user.id}/reset-password`, {
            password: newPassword,
            password_confirmation: confirmPassword,
        });
    };

    const handleDeleteUser = () => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link 
                        href="/admin/users"
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Users</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="outline">
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive"
                            onClick={handleDeleteUser}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </Button>
                    </div>
                </div>

                {/* User Profile Header */}
                <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {user.name}
                                </h1>
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                                    </div>
                                    <Badge variant={user.email_verified_at ? "default" : "destructive"}>
                                        {user.email_verified_at ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        Member since {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Basic Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Full Name
                                </Label>
                                <p className="text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </Label>
                                <p className="text-gray-900 dark:text-white">{user.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Account Status
                                </Label>
                                <div className="flex items-center space-x-2">
                                    {user.email_verified_at ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-green-600 dark:text-green-400">Verified Account</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-red-600 dark:text-red-400">Unverified Account</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Details */}
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Account Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    User ID
                                </Label>
                                <p className="text-gray-900 dark:text-white font-mono">{user.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Created At
                                </Label>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(user.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Last Updated
                                </Label>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(user.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Password Reset */}
                <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Key className="h-5 w-5" />
                            <span>Password Management</span>
                        </CardTitle>
                        <CardDescription>
                            Reset the user's password. They will need to log in with the new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showPasswordReset ? (
                            <Button 
                                onClick={() => setShowPasswordReset(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                            </Button>
                        ) : (
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        This will immediately change the user's password. Make sure to communicate the new password securely.
                                    </AlertDescription>
                                </Alert>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                                
                                <div className="flex space-x-2">
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                                        <Key className="mr-2 h-4 w-4" />
                                        Reset Password
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => {
                                            setShowPasswordReset(false);
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
}
