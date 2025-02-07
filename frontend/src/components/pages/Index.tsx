// import { useState } from 'react';
// // import { DashboardLayout } from '../components/DashboardLayout';
// import { DashboardLayout } from '../dashboard/DashboardLayout';

// import { Users, GraduationCap, BookOpen } from 'lucide-react';

// const Index = () => {
//     const [selectedBatch, setSelectedBatch] = useState('2023-2027');
//     const [selectedSemester, setSelectedSemester] = useState(1);

//     const batches = ['2022-2026', '2023-2027', '2024-2028'];
//     const semesters = [1, 3, 5, 7];

//     const stats = [
//         {
//             label: 'Total Students',
//             value: '120',
//             icon: Users,
//             color: 'bg-blue-100 text-blue-600',
//         },
//         {
//             label: 'Current Semester',
//             value: selectedSemester.toString(),
//             icon: GraduationCap,
//             color: 'bg-green-100 text-green-600',
//         },
//         {
//             label: 'Active Subjects',
//             value: '4',
//             icon: BookOpen,
//             color: 'bg-purple-100 text-purple-600',
//         },
//     ];

//     return (
//         <DashboardLayout>
//             <div className="space-y-6">
//                 <div className="flex items-center space-x-4">
//                     <select
//                         value={selectedBatch}
//                         onChange={(e) => setSelectedBatch(e.target.value)}
//                         className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
//                     >
//                         {batches.map((batch) => (
//                             <option key={batch} value={batch}>
//                                 Batch {batch}
//                             </option>
//                         ))}
//                     </select>
//                     <select
//                         value={selectedSemester}
//                         onChange={(e) => setSelectedSemester(Number(e.target.value))}
//                         className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
//                     >
//                         {semesters.map((semester) => (
//                             <option key={semester} value={semester}>
//                                 Semester {semester}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {stats.map((stat) => (
//                         <div
//                             key={stat.label}
//                             className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary/20 transition-colors"
//                         >
//                             <div className="flex items-center space-x-4">
//                                 <div className={`p-3 rounded-lg ${stat.color}`}>
//                                     <stat.icon size={24} />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm font-medium text-gray-600">{stat.label}</p>
//                                     <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
//                         <div className="space-y-4">
//                             {[1, 2, 3].map((i) => (
//                                 <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
//                                     <div className="w-2 h-2 rounded-full bg-primary"></div>
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-900">Grade Updated</p>
//                                         <p className="text-sm text-gray-600">Student ID: STU{2023100 + i}</p>
//                                     </div>
//                                     <span className="ml-auto text-sm text-gray-500">2h ago</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//                         <div className="grid grid-cols-2 gap-4">
//                             <button className="p-4 text-left bg-primary-light hover:bg-primary/10 rounded-lg transition-colors">
//                                 <h4 className="font-medium text-primary-dark">Add Student</h4>
//                                 <p className="text-sm text-gray-600">Register new student</p>
//                             </button>
//                             <button className="p-4 text-left bg-primary-light hover:bg-primary/10 rounded-lg transition-colors">
//                                 <h4 className="font-medium text-primary-dark">Update Grades</h4>
//                                 <p className="text-sm text-gray-600">Modify student grades</p>
//                             </button>
//                             <button className="p-4 text-left bg-primary-light hover:bg-primary/10 rounded-lg transition-colors">
//                                 <h4 className="font-medium text-primary-dark">View Reports</h4>
//                                 <p className="text-sm text-gray-600">Generate reports</p>
//                             </button>
//                             <button className="p-4 text-left bg-primary-light hover:bg-primary/10 rounded-lg transition-colors">
//                                 <h4 className="font-medium text-primary-dark">Settings</h4>
//                                 <p className="text-sm text-gray-600">Configure dashboard</p>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </DashboardLayout>
//     );
// };

// export default Index;


import { Users, GraduationCap, BookOpen } from 'lucide-react';
import Header from "../layouts/Header";
import Filters from '@/components/dashboard/Filters';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';

const Index = () => {
    return (
        <div className="flex-1 bg-gray-50">
            <Header />
            <div className="p-6">
                <Filters />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatsCard
                        title="Total Students"
                        value="120"
                        icon={<Users className="h-6 w-6 text-blue-500" />}
                        className="bg-blue-50"
                    />
                    <StatsCard
                        title="Current Semester"
                        value="1"
                        icon={<GraduationCap className="h-6 w-6 text-green-500" />}
                        className="bg-green-50"
                    />
                    <StatsCard
                        title="Active Subjects"
                        value="1"
                        icon={<BookOpen className="h-6 w-6 text-purple-500" />}
                        className="bg-purple-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentActivity />
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default Index;