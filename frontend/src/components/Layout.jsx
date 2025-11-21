import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden">
            {/* Global 3D Background - Temporarily disabled */}

            <Sidebar />
            <main className="flex-1 md:ml-[calc(16rem+2rem)] p-4 md:p-8 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
