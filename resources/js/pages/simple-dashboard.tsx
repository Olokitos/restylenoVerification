import { Head } from '@inertiajs/react';

interface SimpleDashboardProps {
    debug?: {
        user_id: number;
        user_name: string;
        timestamp: string;
    };
}

export default function SimpleDashboard({ debug }: SimpleDashboardProps) {
    return (
        <>
            <Head title="Simple Dashboard" />
            <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                color: 'black',
                fontFamily: 'Arial, sans-serif',
                minHeight: '100vh'
            }}>
                <h1 style={{ color: 'blue', fontSize: '32px' }}>Simple Dashboard Test</h1>
                <p>This is a simple test to see if the system is working.</p>
                
                {debug && (
                    <div style={{ 
                        backgroundColor: '#f0f0f0', 
                        padding: '15px', 
                        marginTop: '20px',
                        border: '1px solid #ccc'
                    }}>
                        <h3>Debug Information:</h3>
                        <p><strong>User ID:</strong> {debug.user_id}</p>
                        <p><strong>User Name:</strong> {debug.user_name}</p>
                        <p><strong>Timestamp:</strong> {debug.timestamp}</p>
                    </div>
                )}
                
                <div style={{ marginTop: '20px' }}>
                    <h2>System Features Available:</h2>
                    <ul>
                        <li>✅ User Authentication</li>
                        <li>✅ Wardrobe Management</li>
                        <li>✅ Marketplace System</li>
                        <li>✅ Transaction Management</li>
                        <li>✅ Admin Dashboard</li>
                        <li>✅ Commission Tracking</li>
                        <li>✅ Messaging System</li>
                    </ul>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <h2>Navigation Links:</h2>
                    <a href="/marketplace" style={{ 
                        display: 'inline-block', 
                        margin: '5px', 
                        padding: '10px', 
                        backgroundColor: 'blue', 
                        color: 'white', 
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}>Marketplace</a>
                    
                    <a href="/wardrobe" style={{ 
                        display: 'inline-block', 
                        margin: '5px', 
                        padding: '10px', 
                        backgroundColor: 'green', 
                        color: 'white', 
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}>Wardrobe</a>
                    
                    <a href="/admin/dashboard" style={{ 
                        display: 'inline-block', 
                        margin: '5px', 
                        padding: '10px', 
                        backgroundColor: 'red', 
                        color: 'white', 
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}>Admin Dashboard</a>
                </div>
            </div>
        </>
    );
}
