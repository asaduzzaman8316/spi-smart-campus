'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { verifyQuizAccess, fetchQuizForStudent, submitQuiz, fetchDepartments } from '@/Lib/api';
import { Lock, User, ArrowRight, CheckCircle, XCircle, Clock, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function QuizAccessPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: authUser } = useAuth();

    const [step, setStep] = useState(1); // 1: Access Code, 2: Student Info, 3: Taking Quiz, 4: Success
    const [loading, setLoading] = useState(false);

    // Data
    const [quizData, setQuizData] = useState(null); // Contains .questions array
    const [accessCode, setAccessCode] = useState('');
    const [studentInfo, setStudentInfo] = useState({
        studentId: '',
        department: '',
        semester: '',
        shift: '',
        roll: ''
    });

    // Answers: { [questionId]: 'Option Text' }
    const [answers, setAnswers] = useState({});
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        if (authUser) {
            setStudentInfo(prev => ({
                ...prev,
                studentId: authUser._id || authUser.uid,
                department: authUser.department || '',
                semester: authUser.semester || '',
                shift: authUser.shift || ''
            }));
        }
        fetchDepartments().then(data => setDepartments(data || [])).catch(err => console.error(err));
    }, [authUser]);

    const handleAccessVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await verifyQuizAccess(id, accessCode);
            // res returns { message, data: { department, semester, shift, ... } }
            if (res?.data) {
                setStudentInfo(prev => ({
                    ...prev,
                    department: res.data.department,
                    semester: res.data.semester,
                    shift: res.data.shift
                }));
            }
            setStep(2);
            toast.success('Access Granted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid Access Code');
        } finally {
            setLoading(false);
        }
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetchQuizForStudent(id);
            if (res.data) {
                setQuizData(res.data);
                setStep(3);
            }
        } catch (error) {
            toast.error('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qId, opt) => {
        // Prevent changing answer if already selected?
        // User Requirement: "One selected... cannot be changed"
        if (answers[qId]) return;

        setAnswers(prev => ({
            ...prev,
            [qId]: opt
        }));
    };

    const handleQuizSubmit = async () => {
        // Check if all answered
        if (Object.keys(answers).length < quizData.questions.length) {
            toast.warning(`Please answer all ${quizData.questions.length} questions before submitting.`);
            return;
        }

        setLoading(true);
        try {
            // Format answers for backend
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                questionId: qId,
                selectedOption: val
            }));

            const payload = {
                studentId: studentInfo.studentId || 'guest',
                department: studentInfo.department,
                semester: studentInfo.semester,
                shift: studentInfo.shift,
                roll: studentInfo.roll,
                answers: formattedAnswers
            };

            await submitQuiz(id, payload);
            setStep(4); // Success screen
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission Failed');
        } finally {
            setLoading(false);
        }
    };

    // Calculate progress
    const answeredCount = Object.keys(answers).length;
    const totalCount = quizData?.questions?.length || 0;
    const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#FFFBF2] dark:bg-[#0B1120] flex items-center justify-center p-4 font-sans max-w-full overflow-x-hidden">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative flex flex-col max-h-[90vh]">

                {/* Progress Bar (Global) */}
                <div className="h-2 bg-gray-100 dark:bg-gray-800 w-full shrink-0">
                    <div
                        className="h-full bg-[#FF5C35] transition-all duration-500"
                        style={{ width: step === 3 ? `${25 + (progress * 0.75)}%` : step === 1 ? '10%' : step === 2 ? '25%' : '100%' }}
                    />
                </div>

                <div className="p-6 md:p-12 overflow-y-auto w-full no-scrollbar">
                    {/* Step 1: Access Code */}
                    {step === 1 && (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock size={40} className="text-[#FF5C35]" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2C1810] dark:text-white">Enter Access Code</h2>
                            <p className="text-gray-500 text-sm md:text-base">This quiz is protected. Please enter the code provided by your teacher.</p>

                            <form onSubmit={handleAccessVerify} className="max-w-xs mx-auto space-y-4">
                                <input
                                    type="text"
                                    className="w-full text-center text-2xl tracking-[0.5em] font-bold p-4 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#FF5C35] uppercase outline-none"
                                    placeholder="CODE"
                                    value={accessCode}
                                    onChange={e => setAccessCode(e.target.value)}
                                    maxLength={8}
                                />
                                <button
                                    disabled={loading || !accessCode}
                                    type="submit"
                                    className="w-full py-4 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-xl font-bold shadow-lg shadow-[#FF5C35]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? 'Verifying...' : 'Unlock Quiz'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Student Info */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white">Student Details</h2>
                                <p className="text-gray-500 text-sm">We need a few details before starting.</p>
                            </div>

                            <form onSubmit={handleInfoSubmit} className="max-w-xs mx-auto space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Class Roll No.</label>
                                    <input required type="number" placeholder="e.g. 589623" className="w-full text-center text-xl font-bold p-4 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 outline-none focus:border-[#FF5C35]"
                                        value={studentInfo.roll} onChange={e => setStudentInfo({ ...studentInfo, roll: e.target.value })} />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-[#2C1810] dark:bg-white text-white dark:text-[#2C1810] rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Quiz <ArrowRight size={20} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Taking Quiz - List of Questions */}
                    {step === 3 && quizData && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4 sticky top-0 bg-white dark:bg-[#1E293B] z-10 pt-2">
                                <div>
                                    <span className="text-xs font-bold text-[#FF5C35] uppercase tracking-wider block">{quizData.subject}</span>
                                    <h2 className="text-lg md:text-xl font-bold text-[#2C1810] dark:text-white line-clamp-1">{quizData.title}</h2>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {answeredCount} / {totalCount} Answered
                                </div>
                            </div>

                            <div className="space-y-8">
                                {quizData.questions.map((q, idx) => (
                                    <div key={q._id} className="space-y-4">
                                        <div className="flex gap-3">
                                            <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#FF5C35] text-white font-bold rounded-lg text-sm">{idx + 1}</span>
                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-snug pt-1">
                                                {q.questionText}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-11">
                                            {q.options.map((opt, oIdx) => {
                                                const isSelected = answers[q._id] === opt;
                                                const isAnswered = !!answers[q._id];

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        disabled={isAnswered} // Disable all options for this question once one is picked
                                                        onClick={() => handleOptionSelect(q._id, opt)}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group relative
                                                        ${isSelected
                                                                ? 'border-[#FF5C35] bg-orange-50 dark:bg-orange-900/10 text-[#FF5C35]'
                                                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0F172A] text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                                                            }
                                                        ${isAnswered && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border shrink-0
                                                            ${isSelected ? 'bg-[#FF5C35] text-white border-[#FF5C35]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-transparent'}
                                                        `}>
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <span className="font-medium text-sm md:text-base">{opt}</span>
                                                        {isSelected && <CheckCircle className="absolute right-4 text-[#FF5C35]" size={20} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleQuizSubmit}
                                    disabled={loading || answeredCount < totalCount}
                                    className="w-full py-4 bg-[#FF5C35] hover:bg-[#e64722] text-white rounded-xl font-bold shadow-lg shadow-[#FF5C35]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                                >
                                    {loading ? 'Submitting...' : 'Submit All Answers'}
                                </button>
                                {answeredCount < totalCount && (
                                    <p className="text-center text-xs text-orange-500 mt-2 font-medium flex items-center justify-center gap-1">
                                        <AlertTriangle size={12} /> Please answer all questions to submit.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success Message (No Results) */}
                    {step === 4 && (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 py-8">
                            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-green-50 dark:ring-green-900/20">
                                <Check size={48} strokeWidth={3} />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-[#2C1810] dark:text-white mb-2">
                                    Submission Successful!
                                </h2>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Your answers have been recorded. You can close this page now.
                                </p>
                            </div>

                            <div className="pt-8">
                                <button onClick={() => router.push('/quiz')} className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                    Back to Quiz List
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
