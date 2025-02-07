import { Bell, User } from 'lucide-react';

const Header = () => {
    return (
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome, Professor</h1>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Bell className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <User className="h-5 w-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default Header;