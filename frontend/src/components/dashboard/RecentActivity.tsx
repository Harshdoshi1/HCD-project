const RecentActivity = () => {
    const activities = [
        { id: 'STU2023101', type: 'Grade Updated', time: '2h ago' },
        { id: 'STU2023102', type: 'Grade Updated', time: '2h ago' },
        { id: 'STU2023103', type: 'Grade Updated', time: '2h ago' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                            <p className="font-medium">{activity.type}</p>
                            <p className="text-sm text-gray-600">Student ID: {activity.id}</p>
                        </div>
                        <span className="ml-auto text-sm text-gray-500">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
