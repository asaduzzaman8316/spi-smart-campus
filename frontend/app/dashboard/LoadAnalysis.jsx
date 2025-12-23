"use client";
import React, { useState, useEffect } from 'react';
import { fetchDepartments, analyzeLoad } from '../../Lib/api';
import { BarChart3, Download, Filter, Users, BookOpen, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];

const getDeptShortName = (name) => {
    const map = {
        'Computer': 'CST',
        'Computer Science and Technology': 'CST',
        'Civil': 'CT',
        'Civil Technology': 'CT',
        'Electrical': 'ET',
        'Electrical Technology': 'ET',
        'Electronics': 'ENT',
        'Electronics Technology': 'ENT',
        'Mechanical': 'MT',
        'Mechanical Technology': 'MT',
        'Power': 'PT',
        'Power Technology': 'PT',
        'Electromedical': 'EMT',
        'Electromedical Technology': 'EMT',
        'Environment': 'ENV', // Keeping existing defaults for others
        'Environmental': 'ENV',
        'Architecture': 'ARCH',
        'Data Telecommunication': 'DNT',
        'Telecommunication': 'DNT',
        'Food': 'FT',
        'AIDT': 'AIDT',
        'RAC': 'RAC',
        'Refrigeration and Air Conditioning': 'RAC',
        'Mechatronics': 'MCT'
    };
    // Default to first 3 letters uppercase if not found, or full name if short
    return map[name] || (name.length > 4 ? name.substring(0, 3).toUpperCase() : name.toUpperCase());
};

export default function LoadAnalysis() {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedShift, setSelectedShift] = useState('');

    const [loadData, setLoadData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await fetchDepartments();
            setDepartments(data);
        } catch (error) {
            toast.error('Failed to load departments');
        }
    };

    const handleAnalyze = async () => {
        if (!selectedDepartment) {
            toast.warning('Please select at least a Department');
            return;
        }

        setLoading(true);
        try {
            // Use the centralized analyzeLoad API
            const result = await analyzeLoad(selectedDepartment, selectedSemester, selectedShift);

            if (result.success && result.data) {
                setLoadData({
                    assignments: result.data.assignments,
                    summary: result.data.summary
                });
                toast.success('Load analysis completed!');
            } else {
                setLoadData(null);
                toast.info('No routine data found for these filters');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze load');
            setLoadData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const generatePDF = () => {
        if (!loadData) return;

        const doc = new jsPDF();
        const date = new Date().toLocaleDateString('en-GB');

        // Header
        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text('Sylhet Polytechnic Institute', 105, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.text(`Dept: ${selectedDepartment}`, 105, 25, { align: 'center' });

        doc.setFontSize(12);
        doc.text('Load Distribution', 105, 32, { align: 'center' });

        let shiftText = selectedShift ? `${selectedShift} Shift` : 'All Shifts';
        if (selectedSemester) shiftText += ` - Semester ${selectedSemester}`;
        doc.text(shiftText, 105, 38, { align: 'center' });

        // Group data by teacher
        const groupedData = {};
        loadData.assignments.forEach(item => {
            if (!groupedData[item.teacherName]) {
                groupedData[item.teacherName] = [];
            }
            groupedData[item.teacherName].push(item);
        });

        const tableBody = [];
        let serialNo = 1;

        Object.keys(groupedData).forEach(teacherName => {
            const assignments = groupedData[teacherName];
            const totalTeacherLoad = assignments.reduce((sum, curr) => sum + curr.totalLoad, 0);

            assignments.forEach((assignment, index) => {
                const row = [];

                // Col 1: SL (RowSpan)
                if (index === 0) {
                    row.push({ content: serialNo++, rowSpan: assignments.length, styles: { valign: 'middle', halign: 'center' } });
                }

                // Col 2: Teacher Name (RowSpan)
                if (index === 0) {
                    row.push({ content: teacherName, rowSpan: assignments.length, styles: { valign: 'middle' } });
                }

                // Col 3: Subject Name
                row.push(assignment.subject);

                // Col 4: Sub Code
                row.push(assignment.subjectCode);

                // Col 5: Technology
                row.push(assignment.technology);

                // Col 6: T
                row.push({ content: assignment.theoryPeriods || 0, styles: { halign: 'center' } });

                // Col 7: P
                row.push({ content: assignment.practicalPeriods || 0, styles: { halign: 'center' } });

                // Col 8: Load (Subject Total)
                row.push({ content: assignment.totalLoad || 0, styles: { halign: 'center' } });

                // Col 9: Total Load (Teacher Total - RowSpan)
                if (index === 0) {
                    row.push({ content: totalTeacherLoad, rowSpan: assignments.length, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold' } });
                }

                // Col 10: Room
                row.push(assignment.rooms);

                // Col 11: Remarks
                row.push('');

                tableBody.push(row);
            });
        });

        // Add summary/total row at the end
        tableBody.push([
            { content: '', colSpan: 5, styles: { fillColor: [255, 255, 255] } }, // Spacer
            { content: loadData.summary.totalTheory, styles: { halign: 'center', fontStyle: 'bold' } },
            { content: loadData.summary.totalPractical, styles: { halign: 'center', fontStyle: 'bold' } },
            { content: loadData.summary.totalPeriods, styles: { halign: 'center', fontStyle: 'bold' } },
            { content: '', colSpan: 3, styles: { fillColor: [255, 255, 255] } }
        ]);

        autoTable(doc, {
            head: [[
                { content: 'SL.N', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Name of the teacher', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Subject Name', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Sub Code', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Technology', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Load', colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                { content: 'Total Load', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Lab/ Shop/ Room', styles: { halign: 'center', valign: 'middle' } },
                { content: 'Rema rks', styles: { halign: 'center', valign: 'middle' } }
            ], [
                { content: '', colSpan: 5 }, // Skip first 5
                { content: 'T', styles: { halign: 'center' } },
                { content: 'P', styles: { halign: 'center' } },
                { content: 'Load', styles: { halign: 'center' } },
                { content: '', colSpan: 3 } // Skip last 3
            ]],
            body: tableBody,
            startY: 45,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 2,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                textColor: [0, 0, 0], // Black text
                font: "times" // Serif font matches document
            },
            headStyles: {
                fillColor: [255, 255, 255], // White background for header
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 8 },  // SL
                1: { cellWidth: 35 }, // Teacher Name
                2: { cellWidth: 35 }, // Subject
                3: { cellWidth: 15 }, // Code
                4: { cellWidth: 35 }, // Technology
                5: { cellWidth: 8 },  // T
                6: { cellWidth: 8 },  // P
                7: { cellWidth: 10 }, // Load
                8: { cellWidth: 10 }, // Total Load
                9: { cellWidth: 15 }, // Room
                10: { cellWidth: 12 } // Remarks
            },
            didParseCell: function (data) {
                // Ensure hidden cells (due to rowspan) aren't drawn incorrectly
                // autoTable handles this automatically if configured right
            }
        });

        // Summary Statistics at the bottom
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Total Teachers: ${loadData.summary.totalTeachers}`, 14, finalY);
        doc.text(`Total Assignments: ${loadData.summary.totalAssignments}`, 14, finalY + 5);
        doc.text(`Average Load: ${loadData.summary.averageLoad}`, 14, finalY + 10);

        // Footer signature areas
        doc.text("________________", 40, finalY + 40, { align: 'center' });
        doc.text("Department Head", 40, finalY + 45, { align: 'center' });

        doc.text("________________", 170, finalY + 40, { align: 'center' });
        doc.text("Principal", 170, finalY + 45, { align: 'center' });

        doc.save(`load_distribution_${selectedDepartment}_${date.replace(/\//g, '-')}.pdf`);
    };

    return (
        <div className="min-h-screen bg-white/50 dark:bg-slate-950 p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Load Analysis
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            Analyze and optimize teacher workloads across departments
                        </p>
                    </div>
                </div>

                {/* Filter Card */}
                <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 bg-orange-50 dark:bg-orange-500/10 w-fit px-4 py-2 rounded-full border border-orange-100 dark:border-orange-500/20">
                        <Filter className="text-orange-600 dark:text-orange-400" size={18} />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-orange-900 dark:text-orange-100">
                            Analysis Filters
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Department</label>
                            <div className="relative group">
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900 rounded-xl px-5 py-3.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept, index) => (
                                        <option key={index} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                    <Users size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Semester</label>
                            <div className="relative group">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900 rounded-xl px-5 py-3.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Semesters</option>
                                    {SEMESTERS.map((sem, index) => (
                                        <option key={index} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                    <BookOpen size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Shift</label>
                            <div className="relative group">
                                <select
                                    value={selectedShift}
                                    onChange={(e) => setSelectedShift(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900 rounded-xl px-5 py-3.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Shifts</option>
                                    {SHIFTS.map((shift, index) => (
                                        <option key={index} value={shift}>{shift} Shift</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                    <Clock size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 flex justify-center items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 size={20} />
                                        <span>Analyze Load</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {loadData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out">
                        {[
                            { label: 'Total Teachers', value: loadData.summary.totalTeachers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Total Assignments', value: loadData.summary.totalAssignments, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            { label: 'Total Periods', value: loadData.summary.totalPeriods, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            { label: 'Avg Teacher Load', value: loadData.summary.averageLoad, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-1 transition-transform cursor-default">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon className={stat.color} size={24} />
                                    </div>
                                    <span className="text-3xl font-bold text-slate-700 dark:text-white">
                                        {stat.value}
                                    </span>
                                </div>
                                <p className="text-slate-400 font-medium uppercase tracking-wider text-xs">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results Table */}
                {loadData && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                                    Distribution Report
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    Detailed breakdown of assignments and periods
                                </p>
                            </div>
                            <button
                                onClick={generatePDF}
                                className="group flex items-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-800/20 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                            >
                                <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                                <span>Export PDF</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                        <th className="p-6">Teacher</th>
                                        <th className="p-6">Subject</th>
                                        <th className="p-6">Dept/Group</th>
                                        <th className="p-6 text-center">Theory</th>
                                        <th className="p-6 text-center">Practical</th>
                                        <th className="p-6 text-center">Total Load</th>
                                        <th className="p-6">Rooms</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loadData.assignments.map((assignment, index) => (
                                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-orange-600 transition-colors">
                                                    {assignment.teacherName}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono mt-1">SL: {String(index + 1).padStart(2, '0')}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                    {assignment.subject}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                                                    {assignment.subjectCode}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    {assignment.technology.split(', ').map((tech, i) => (
                                                        <span key={i} className="inline-block bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md text-xs font-bold w-fit">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center font-medium text-slate-600 dark:text-slate-400">
                                                {assignment.theoryPeriods || 0}
                                            </td>
                                            <td className="p-6 text-center font-medium text-slate-600 dark:text-slate-400">
                                                {assignment.practicalPeriods || 0}
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg shadow-slate-900/20">
                                                    {assignment.totalLoad || 0}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 inline-block">
                                                    {assignment.rooms || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan="3" className="p-6 text-right font-bold uppercase tracking-wider text-slate-400">
                                            Grand Totals
                                        </td>
                                        <td className="p-6 text-center font-bold text-lg">
                                            {loadData.summary.totalTheory}
                                        </td>
                                        <td className="p-6 text-center font-bold text-lg">
                                            {loadData.summary.totalPractical}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="text-2xl font-black text-orange-400">
                                                {loadData.summary.totalPeriods}
                                            </div>
                                        </td>
                                        <td className="p-6"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loadData && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <BarChart3 className="text-slate-400" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Ready to Analyze</h3>
                        <p className="text-slate-500 max-w-sm text-center">
                            Select a department and criteria above to optimize your resource allocation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
