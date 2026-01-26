"use client";
import React, { useState, useEffect } from 'react';
import {
    Users,
    Bell,
    AlertCircle,
    BarChart3,
    Building,
    FileText
} from 'lucide-react';
import api, { fetchNotices, fetchTeachers, fetchRoutines, fetchDepartments, analyzeLoad } from '../../Lib/api';
import { useRouter } from 'next/navigation';
import Loader1 from '@/components/Ui/Loader1';

export default function InstituteOverview({ setActiveView }) {
    const [stats, setStats] = useState({
        teachers: 0,
        tempTeachers: 0,
        departments: 0,
        complaints: { total: 0, pending: 0, resolved: 0 },
        notices: 0,
        totalLoad: 0
    });
    const [recentnotices, setRecentNotices] = useState([]);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [deptLoads, setDeptLoads] = useState([]);
    const [deptTeachers, setDeptTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Basic Data
                const [teachersData, departmentsData, noticesResp, complaintsResp, loadAnalysisResp] = await Promise.all([
                    fetchTeachers(''),
                    fetchDepartments(),
                    fetchNotices(''),
                    api.get('/complaints'),
                    analyzeLoad('', '', '') // Fetch institute-wide load analysis
                ]);

                // Process Teachers
                const allTeachers = Array.isArray(teachersData) ? teachersData : (teachersData.data || []);
                const guestTeachers = allTeachers.filter(t => t.type === 'Guest' || t.designation?.toLowerCase().includes('guest'));

                // Process Complaints
                const allComplaints = complaintsResp.data || [];

                // Process Notices
                const allNotices = noticesResp.data || [];

                // Process Load from analyzeLoad API
                const loadData = loadAnalysisResp.data || {};
                const instituteTotalLoad = loadData.summary ? loadData.summary.totalPeriods : 0;

                // Department breakdown for chart
                const departmentLoadMap = loadData.summary ? loadData.summary.departmentLoads : {};
                const sortedDeptLoads = Object.entries(departmentLoadMap)
                    .map(([name, load]) => ({ name, load }))
                    .sort((a, b) => b.load - a.load)
                    .slice(0, 5);

                // Teachers per Department
                const teachersPerDept = {};
                allTeachers.forEach(t => {
                    if (t.department) {
                        teachersPerDept[t.department] = (teachersPerDept[t.department] || 0) + 1;
                    }
                });
                const sortedDeptTeachers = Object.entries(teachersPerDept)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats({
                    teachers: allTeachers.length,
                    tempTeachers: guestTeachers.length,
                    departments: departmentsData.length,
                    complaints: {
                        total: allComplaints.length,
                        pending: allComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
                        resolved: allComplaints.filter(c => c.status === 'Resolved').length
                    },
                    notices: allNotices.length,
                    totalLoad: instituteTotalLoad
                });

                setRecentNotices(allNotices.slice(0, 4));
                setRecentComplaints(allComplaints.slice(0, 4));
                setDeptLoads(sortedDeptLoads);
                setDeptTeachers(sortedDeptTeachers);

            } catch (error) {
                console.error("Failed to fetch institute data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Loader1 />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans bg-[#FFFBF2] dark:bg-[#0B1120] min-h-screen p-2 lg:p-6 rounded-3xl">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2C1810] dark:bg-black p-2 lg:p-8 shadow-2xl">
                <div className="absolute inset-0 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                            Institute Overview
                        </h1>
                        <p className="text-orange-100/90 max-w-xl font-medium">
                            Comprehensive analysis across all departments, teachers, and academic activities.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white">
                            <div className="text-xs text-orange-200 uppercase tracking-wider font-bold">Total Departments</div>
                            <div className="text-2xl font-bold">{7}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Faculty"
                    value={stats.teachers}
                    icon={Users}
                    color="blue"
                // trend={`${stats.tempTeachers} Guest`}
                />
                <StatCard
                    label="System Load"
                    value={stats.totalLoad}
                    icon={BarChart3}
                    color="purple"
                    trend="Periods/week"
                />
                <StatCard
                    label="Active Issues"
                    value={stats.complaints.pending}
                    icon={AlertCircle}
                    color="orange"
                    trend={`${stats.complaints.resolved} Resolved`}
                />
                <StatCard
                    label="Total Notices"
                    value={stats.notices}
                    icon={Bell}
                    color="emerald"
                    trend="System wide"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Load Distribution Chart */}
                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white flex items-center gap-2">
                                <Building className="text-[#FF5C35]" size={24} />
                                Department Workload
                            </h3>
                        </div>
                        <div className="space-y-6">
                            {deptLoads.map((item, index) => (
                                <div key={index} className="relative group">
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{item.load} periods</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#FF5C35] rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(item.load / Math.max(...deptLoads.map(d => d.load))) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Notices List */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Notices</h3>
                            <button onClick={() => setActiveView('notices')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentnotices.map((notice, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 transition flex items-start gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-indigo-500">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block mb-1">{new Date(notice.date).toLocaleDateString()}</span>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{notice.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Faculty Distribution */}
                    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-[#2C1810] dark:text-white mb-6">Staffing Overview</h3>
                        <div className="space-y-4">
                            {deptTeachers.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Complaint Status */}
                    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-[#2C1810] dark:text-white mb-6">Complaint Status</h3>
                        <div className="flex items-center gap-6 justify-center">
                            <div className="relative w-28 h-28 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className="text-[#FF5C35]"
                                        strokeDasharray={`${(stats.complaints.pending / stats.complaints.total) * 100}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.complaints.total}</span>
                                    <span className="text-[9px] text-slate-400 uppercase">Total</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#FF5C35]"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Pending ({stats.complaints.pending})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Resolved ({stats.complaints.resolved})</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div className="space-y-3">
                                {recentComplaints.slice(0, 2).map((c, i) => (
                                    <div key={i} className="text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">{c.issueType}</p>
                                        <p className="text-gray-500 flex justify-between mt-1">
                                            <span>{c.department}</span>
                                            <span className={`font-bold ${c.status === 'Resolved' ? 'text-green-500' : 'text-[#FF5C35]'}`}>{c.status}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
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
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{trend}</span>
                </div>
            </div>
            <h3 className="text-3xl font-bold text-[#2C1810] dark:text-white mb-1">{value}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
        </div>
    );
}
