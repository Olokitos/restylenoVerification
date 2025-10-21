import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    Plus, 
    Edit3, 
    Trash2, 
    Eye,
    ArrowLeft,
    Crown,
    Mail,
    Calendar,
    Shield,
    MoreVertical
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
}

interface UsersPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function UsersIndex({ users }: UsersPageProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteUser = (userId: number) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    const filteredUsers = users.data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/dashboard"
                            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Admin Dashboard</span>
                        </Link>
                    </div>
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Manage user accounts, view user information, and perform administrative actions.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.total}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {users.data.filter(user => user.email_verified_at).length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Verified Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {users.data.filter(user => !user.email_verified_at).length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Unverified Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredUsers.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Manage Users</CardTitle>
                                <CardDescription>Search, filter, and manage user accounts</CardDescription>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Users ({filteredUsers.length})
                    </h2>

                    {filteredUsers.length === 0 ? (
                        <Card className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-12 text-center">
                                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No users found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {searchTerm ? 'Try adjusting your search terms' : 'No users have registered yet'}
                                </p>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First User
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <Card key={user.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <Badge variant={user.email_verified_at ? "default" : "destructive"}>
                                                            {user.email_verified_at ? "Verified" : "Unverified"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
