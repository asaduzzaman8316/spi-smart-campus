"use client";
import React, { useState, useEffect } from 'react';
import { analyzeLoad, fetchDepartments } from '../../Lib/api';
import { BarChart3, Download, Filter, Users, BookOpen, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
const SHIFTS = ["1st", "2nd"];

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
            // Pass empty strings if not selected to fetch all
            const result = await analyzeLoad(selectedDepartment, selectedSemester, selectedShift);
            if (result.success) {
                setLoadData(result.data);
                toast.success('Load analysis completed!');
            } else {
                toast.error(result.message || 'No data found');
                setLoadData(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to analyze load');
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
                row.push({ content: assignment.theoryPeriods, styles: { halign: 'center' } });

                // Col 7: P
                row.push({ content: assignment.practicalPeriods, styles: { halign: 'center' } });

                // Col 8: Load (Subject Total)
                row.push({ content: assignment.totalLoad, styles: { halign: 'center' } });

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
            didParseCell: function(data) {
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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#FF5C35]/10 flex items-center justify-center">
                            <BarChart3 className="text-[#FF5C35]" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">
                                Load Analysis
                            </h1>
                            <p className="text-[#2C1810]/70 dark:text-gray-400">
                                Calculate teacher workloads from routines
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-[#FF5C35]" size={20} />
                        <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">
                            Select Criteria
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Department <span className="text-red-500">*</span></label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">Select Department</option>
                                {departments.slice(0, 7).map((dept, index) => (
                                    <option key={index} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Semester (Optional)</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">All Semesters</option>
                                {SEMESTERS.map((sem, index) => (
                                    <option key={index} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Shift (Optional)</label>
                            <select
                                value={selectedShift}
                                onChange={(e) => setSelectedShift(e.target.value)}
                                className="w-full bg-background border border-border-color rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring focus:ring-brand-mid focus:border-brand-mid transition-all"
                            >
                                <option value="">All Shifts</option>
                                {SHIFTS.map((shift, index) => (
                                    <option key={index} value={shift}>{shift} Shift</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full bg-[#FF5C35] hover:bg-[#e64722] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-[#FF5C35]/20 hover:shadow-[#FF5C35]/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Load'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {loadData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Users className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Teachers</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalTeachers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Assignments</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalAssignments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Clock className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Total Periods</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.totalPeriods}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="text-[#FF5C35]" size={24} />
                                <div>
                                    <p className="text-sm text-text-secondary">Average Load</p>
                                    <p className="text-2xl font-bold text-foreground">{loadData.summary.averageLoad}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Table */}
                {loadData && (
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold font-serif text-[#2C1810] dark:text-white">
                                Teacher Load Distribution
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={generatePDF}
                                    className="inline-flex items-center gap-2 bg-[#FF5C35] hover:bg-[#e64722] text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                                >
                                    <FileText size={18} />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-[#FF5C35] text-white">
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">SL</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Teacher Name</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Subject</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Code</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Technology</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Theory</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Practical</th>
                                        <th className="border border-white/20 px-4 py-3 text-center font-semibold">Total</th>
                                        <th className="border border-white/20 px-4 py-3 text-left font-semibold">Rooms</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadData.assignments.map((assignment, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-[#1E293B]' : 'bg-[#FFFBF2] dark:bg-[#151e2e]'}>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white font-medium">
                                                {assignment.teacherName}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {assignment.subject}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white">
                                                {assignment.subjectCode}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white text-sm">
                                                {assignment.technology}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white font-semibold">
                                                {assignment.theoryPeriods}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white font-semibold">
                                                {assignment.practicalPeriods}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#FF5C35] font-bold">
                                                {assignment.totalLoad}
                                            </td>
                                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-[#2C1810] dark:text-white text-sm">
                                                {assignment.rooms}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-[#FF5C35]/10 font-bold">
                                        <td colSpan="5" className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-right text-[#2C1810] dark:text-white">
                                            Total Load:
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white">
                                            {loadData.summary.totalTheory}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#2C1810] dark:text-white">
                                            {loadData.summary.totalPractical}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-[#FF5C35] text-lg">
                                            {loadData.summary.totalPeriods}
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loadData && !loading && (
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
                        <BarChart3 className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
                        <h3 className="text-2xl font-semibold text-foreground mb-2">No Analysis Yet</h3>
                        <p className="text-text-secondary">Select criteria and click "Analyze Load" to view teacher workloads</p>
                    </div>
                )}
            </div>
        </div>
    );
}
