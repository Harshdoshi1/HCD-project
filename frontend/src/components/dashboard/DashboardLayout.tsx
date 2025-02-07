import { ReactNode } from 'react';
import { Sidebar } from "../sidebar/Sidebar";
import { Bell, User } from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between h-full px-6">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-800">Welcome, Professor</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                                <Bell size={20} />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-primary transition-colors">
                                <User size={20} />
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6 animate-fadeIn">
                    {children}
                </main>
            </div>
        </div>
    );
};

