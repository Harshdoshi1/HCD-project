import { UserPlus, PenSquare, FileText, Settings } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        {
            title: 'Add Student',
            description: 'Register new student',
            icon: UserPlus,
            color: 'bg-blue-50 text-blue-500',
        },
        {
            title: 'Update Grades',
            description: 'Modify student grades',
            icon: PenSquare,
            color: 'bg-purple-50 text-purple-500',
        },
        {
            title: 'View Reports',
            description: 'Generate reports',
            icon: FileText,
            color: 'bg-green-50 text-green-500',
        },
        {
            title: 'Settings',
            description: 'Configure dashboard',
            icon: Settings,
            color: 'bg-orange-50 text-orange-500',
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.title}
                        className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-left"
                    >
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                            <action.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;