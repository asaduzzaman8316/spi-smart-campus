"use client";
import React, { useState, useEffect } from 'react';
import {
    Users,
    Bell,
    AlertCircle,
    BookOpen,
    BarChart3,
    ArrowUp,
    ArrowRight,
    CheckCircle,
    Clock,
    FileText
} from 'lucide-react';
import api, { fetchNotices, fetchTeachers, analyzeLoad } from '../../Lib/api';
import { useRouter } from 'next/navigation';
import Loader1 from '@/components/Ui/Loader1';

export default function DepartmentOverview({ user, setActiveView }) {
    const [stats, setStats] = useState({
        teachers: 0,
        complaints: { total: 0, pending: 0, resolved: 0 },
        notices: 0,
        totalLoad: 0
    });
    const [recentnotices, setRecentNotices] = useState([]);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loadDistribution, setLoadDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.department) return;

            try {
                setLoading(true);

                // 1. Fetch Teachers
                const teachersData = await fetchTeachers('', user.department);
                const teacherCount = Array.isArray(teachersData) ? teachersData.length : (teachersData.data ? teachersData.data.length : 0);

                // 2. Fetch Complaints (Filtered by Dept)
                const { data: allComplaints } = await api.get('/complaints');
                const deptComplaints = allComplaints.filter(c => c.department === user.department || c.department === 'All');

                // 3. Fetch Notices (Filtered by Dept)
                const noticesData = await fetchNotices('', user.department);
                const deptNotices = noticesData.data || [];

                // 4. Analyze Load
                const loadAnalysis = await analyzeLoad(user.department, '', '');

                // Set Stats
                setStats({
                    teachers: teacherCount,
                    complaints: {
                        total: deptComplaints.length,
                        pending: deptComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
                        resolved: deptComplaints.filter(c => c.status === 'Resolved').length
                    },
                    notices: deptNotices.length,
                    totalLoad: loadAnalysis.summary ? loadAnalysis.summary.totalPeriods : 0
                });

                // Set Lists
                setRecentNotices(deptNotices.slice(0, 3));
                setRecentComplaints(deptComplaints.slice(0, 3));

                // Set Top Load (Top 5 Teachers)
                if (loadAnalysis.assignments) {
                    const teacherLoads = {};
                    loadAnalysis.assignments.forEach(a => {
                        if (!teacherLoads[a.teacherName]) teacherLoads[a.teacherName] = 0;
                        teacherLoads[a.teacherName] += a.totalLoad;
                    });

                    const sortedLoad = Object.entries(teacherLoads)
                        .map(([name, load]) => ({ name, load }))
                        .sort((a, b) => b.load - a.load)
                        .slice(0, 5);

                    setLoadDistribution(sortedLoad);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <Loader1 />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 bg-[#FFFBF2] dark:bg-[#0B1120] min-h-screen pt-18 p-4 rounded-3xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C1810] dark:text-white tracking-tight mb-2">
                        {user.department} Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Real-time analytics and department performance
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveView('notices')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
                    >
                        <Bell size={18} /> Notices
                    </button>
                    <button
                        onClick={() => setActiveView('complaints')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
                    >
                        <AlertCircle size={18} /> Complaints
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Teachers"
                    value={stats.teachers}
                    icon={Users}
                    color="blue"
                    trend="+2 new"
                />
                <StatCard
                    label="Pending Issues"
                    value={stats.complaints.pending}
                    icon={AlertCircle}
                    color="orange"
                    trend={`${stats.complaints.resolved} resolved`}
                />
                <StatCard
                    label="Active Notices"
                    value={stats.notices}
                    icon={Bell}
                    color="purple"
                    trend="Updated today"
                />
                <StatCard
                    label="Weekly Load"
                    value={stats.totalLoad}
                    icon={BookOpen}
                    color="emerald"
                    trend="Classes/week"
                />
            </div>

            {/* Charts & Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Graph: Load Distribution */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-4 lg:p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white flex items-center gap-2">
                                <BarChart3 className="text-[#FF5C35]" size={24} />
                                Workload Distribution
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Top teachers by assigned periods</p>
                        </div>
                    </div>

                    {/* Custom CSS Bar Chart */}
                    <div className="space-y-6">
                        {loadDistribution.map((item, index) => (
                            <div key={index} className="relative group">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{item.load} periods</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FF5C35] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(item.load / Math.max(...loadDistribution.map(d => d.load))) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Panel: Recent Activity */}
                <div className="space-y-6">
                    {/* Complaint Status Donut (Simulated) */}
                    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6">Complaint Status</h3>
                        <div className="flex items-center gap-8">
                            <div className="relative w-32 h-32 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {/* Circle Background */}
                                    <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                                    {/* Resolved Segment */}
                                    <path className="text-[#FF5C35]"
                                        strokeDasharray={`${(stats.complaints.resolved / stats.complaints.total) * 100}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.complaints.total}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5C35]"></div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-bold text-slate-900 dark:text-white block">{stats.complaints.resolved}</span>
                                        Resolved
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-bold text-slate-900 dark:text-white block">{stats.complaints.pending}</span>
                                        Pending
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notices */}
                    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">Recent Notices</h3>
                            <button onClick={() => setActiveView('notices')} className="text-xs text-orange-600 font-bold hover:underline cursor-pointer">View All</button>
                        </div>
                        <div className="space-y-4">
                            {recentnotices.length > 0 ? recentnotices.map((notice, i) => (
                                <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition">
                                    <div className="bg-orange-100/50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {notice.title}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {new Date(notice.date).toLocaleDateString()} • {notice.category}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 italic">No recent notices</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    };

    return (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
                    <ArrowUp size={12} className="text-[#FF5C35]" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{trend}</span>
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        </div>
    );
}
