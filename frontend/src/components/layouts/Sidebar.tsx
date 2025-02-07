import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Settings, X } from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Students', path: '/students' },
        { icon: GraduationCap, label: 'Grades', path: '/grades' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                {!isCollapsed && <h1 className="text-xl font-semibold text-[#00A3FF]">Faculty Portal</h1>}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            </div>
            <nav className="p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg mb-2 text-gray-700 hover:text-gray-900"
                    >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;