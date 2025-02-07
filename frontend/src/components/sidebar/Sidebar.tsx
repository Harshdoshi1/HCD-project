import { useState } from 'react';
import { Menu, X, Book, Users, PieChart, Settings, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
    className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
    const [expanded, setExpanded] = useState(true);

    const menuItems = [
        { icon: PieChart, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Students', path: '/students' },
        { icon: Book, label: 'Grades', path: '/grades' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside
            className={cn(
                "h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200",
                expanded ? "w-64" : "w-20",
                className
            )}
        >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                {expanded ? (
                    <h2 className="text-xl font-semibold text-primary">Faculty Portal</h2>
                ) : (
                    <span className="text-xl font-semibold text-primary">FP</span>
                )}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                >
                    {expanded ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.path}
                        className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-light hover:text-primary-dark transition-colors group"
                    >
                        <item.icon size={20} />
                        {expanded && (
                            <span className="ml-3 text-sm font-medium">{item.label}</span>
                        )}
                        {!expanded && (
                            <ChevronRight
                                size={16}
                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                    </a>
                ))}
            </nav>
        </aside>
    );
};