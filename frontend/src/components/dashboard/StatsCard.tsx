import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    className?: string;
}

const StatsCard = ({ title, value, icon, className = '' }: StatsCardProps) => {
    return (
        <div className={`bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4 ${className}`}>
            <div className={`p-3 rounded-lg ${className}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-semibold mt-1">{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;