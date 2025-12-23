"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTeachers, fetchRooms, fetchSubjects, fetchDepartments, fetchRoutines, createRoutine } from '../../Lib/api';
import { toast } from 'react-toastify';
import { generateBatchRoutines, generateRoutine, refactorRoutine } from '../../Lib/AutoRoutineGenerator';

// Modular Components
import { DAYS, INITIAL_ROUTINE, SEMESTERS, SHIFTS, GROUPS } from './RoutineBuilderComponents/constants';
import ControlHeader from './RoutineBuilderComponents/ControlHeader';
import ConfigPanels from './RoutineBuilderComponents/ConfigPanels';
import ClassEditor from './RoutineBuilderComponents/ClassEditor';
import RoutinePreview from './RoutineBuilderComponents/RoutinePreview';

// Modals
import ShiftSelectionModal from './RoutineBuilderComponents/Modals/ShiftSelectionModal';
import RefactorModal from './RoutineBuilderComponents/Modals/RefactorModal';
import FailuresModal from './RoutineBuilderComponents/Modals/FailuresModal';
import AutoGenerateModal from './RoutineBuilderComponents/Modals/AutoGenerateModal';
import TechSelectionModal from './RoutineBuilderComponents/Modals/TechSelectionModal';
import BatchMergeModal from './RoutineBuilderComponents/Modals/BatchMergeModal';

export default function RoutineBuilder({ onBack, initialData }) {
    const router = useRouter();
    const [routine, setRoutine] = useState(INITIAL_ROUTINE);
    const [activeDay, setActiveDay] = useState("Sunday");
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [batchShift, setBatchShift] = useState(""); // "1st" or "2nd"
    const [showShiftSelectionModal, setShowShiftSelectionModal] = useState(false);
    const [generationFailures, setGenerationFailures] = useState([]); // Array of { routine, items: [] }
    const [showFailuresModal, setShowFailuresModal] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allRoutines, setAllRoutines] = useState([]);

    // Batch Generator State
    const [assignments, setAssignments] = useState([]); // [{ id, teacherId, teacherName, subjects: [{ id, subject, theory: 2, lab: 0, technologies: [] }], blockedTimes: [] }]
    const [technologyOptions, setTechnologyOptions] = useState([]); // Pre-computed list of all possible "Dept-Sem-Shift-Grp"

    // UI Helpers state
    const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
    const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

    // Tech Modal State
    const [showTechModal, setShowTechModal] = useState(false);
    const [activeTechSelection, setActiveTechSelection] = useState(null); // { assignId, subId }
    const [techModalSearchTerm, setTechModalSearchTerm] = useState("");

    // Batch Merge Modal State
    const [batchMergeData, setBatchMergeData] = useState(null); // { assignId, subId, sourceTechId }
    const [showBatchMergeModal, setShowBatchMergeModal] = useState(false);
    const [batchMergeSearchTerm, setBatchMergeSearchTerm] = useState("");

    // Refactor State
    const [showRefactorModal, setShowRefactorModal] = useState(false);
    const [isRefactoring, setIsRefactoring] = useState(false);
    const [refactorConfig, setRefactorConfig] = useState({ reduceLab: false, targetDept: '' });

    const [teacherFilterDept, setTeacherFilterDept] = useState('');
    const [roomFilterType, setRoomFilterType] = useState('');
    const [roomFilterLocation, setRoomFilterLocation] = useState('');
    const [roomFilterDept, setRoomFilterDept] = useState('');

    // Filtered lists for simple logic
    const filteredTeachers = useMemo(() => teacherFilterDept
        ? teachers.filter(t => t.department === teacherFilterDept)
        : teachers, [teachers, teacherFilterDept]);

    const filteredRooms = useMemo(() => rooms.filter(r => {
        if (roomFilterType && r.type !== roomFilterType) return false;
        if (roomFilterLocation && r.location !== roomFilterLocation) return false;
        if (roomFilterDept && r.department !== roomFilterDept) return false;
        return true;
    }), [rooms, roomFilterType, roomFilterLocation, roomFilterDept]);


    useEffect(() => {
        if (initialData) {
            const sanitizedData = {
                ...initialData,
                days: initialData.days.map(day => ({
                    ...day,
                    classes: day.classes.map(cls => ({
                        ...cls,
                        id: cls.id || Math.random().toString(36).substr(2, 9)
                    }))
                }))
            };
            setRoutine(sanitizedData);
            setIsEditMode(true);
        }
    }, [initialData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersData, roomsData, subjectsData, departmentsData, routinesData] = await Promise.all([
                    fetchTeachers(),
                    fetchRooms(),
                    fetchSubjects(),
                    fetchDepartments(),
                    fetchRoutines()
                ]);

                setTeachers(
                    (Array.isArray(teachersData) ? teachersData : (teachersData.data || []))
                        .map(d => ({ ...d, id: d._id }))
                        .sort((a, b) => a.name.localeCompare(b.name))
                );
                setRooms(Array.isArray(roomsData)
                    ? roomsData.map(d => ({ ...d, id: d._id, isLab: d.type === 'Lab' }))
                    : (roomsData.data || []).map(d => ({ ...d, id: d._id, isLab: d.type === 'Lab' }))
                );
                setSubjects(
                    (Array.isArray(subjectsData) ? subjectsData : (subjectsData.data || []))
                        .map(d => ({ ...d, id: d._id }))
                        .sort((a, b) => a.name.localeCompare(b.name))
                );
                setDepartments(Array.isArray(departmentsData) ? departmentsData.map(d => ({ ...d, id: d._id })) : (departmentsData.data || []).map(d => ({ ...d, id: d._id })));
                setAllRoutines(Array.isArray(routinesData) ? routinesData.map(d => ({ ...d, id: d._id })) : (routinesData.data || []).map(d => ({ ...d, id: d._id })));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Generate Technology Options when departments change
    useEffect(() => {
        if (Array.isArray(departments) && departments.length > 0) {
            const options = [];
            departments.forEach(dept => {
                SEMESTERS.forEach(sem => {
                    SHIFTS.forEach(shift => {
                        if (batchShift && shift !== batchShift) return;
                        GROUPS.forEach(grp => {
                            const deptName = dept.name.toLowerCase();
                            const isCivil = deptName.includes('civil');
                            if (shift === "1st") {
                                if (grp === "C1") { if (!isCivil) return; } else if (grp === "C2") { return; } else if (!grp.endsWith("1")) { return; }
                            } else if (shift === "2nd") {
                                if (grp === "C2") { if (!isCivil) return; } else if (grp === "C1") { return; } else if (!grp.endsWith("2")) { return; }
                            }
                            options.push({
                                id: `${dept.name}|${sem}|${shift}|${grp}`,
                                label: `${dept.name} - ${sem} - ${shift} (${grp})`,
                                dept: dept.name, sem, shift, grp
                            });
                        });
                    });
                });
            });
            setTechnologyOptions(options);
        }
    }, [departments, batchShift]);

    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setRoutine(prev => ({
            ...prev,
            [name]: name === 'semester' ? Number(value) : value
        }));
    };

    const isTimeOverlap = (start1, end1, start2, end2) => {
        if (!start1 || !end1 || !start2 || !end2) return false;
        const getMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const s1 = getMinutes(start1);
        const e1 = getMinutes(end1);
        const s2 = getMinutes(start2);
        const e2 = getMinutes(end2);
        return Math.max(s1, s2) < Math.min(e1, e2);
    };

    const getTeacherStatus = (dayName, startTime, endTime, currentClassId, currentSubject) => {
        if (!startTime || !endTime) return { busy: new Set(), shared: new Set() };
        const busyTeachers = new Set();
        const sharedTeachers = new Set();
        const teacherUsageCounts = {};
        const processClass = (c) => {
            if (c.teacher && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                teacherUsageCounts[c.teacher] = (teacherUsageCounts[c.teacher] || 0) + 1;
                if (currentSubject && c.subject === currentSubject) { sharedTeachers.add(c.teacher); } else { busyTeachers.add(c.teacher); }
            }
        };
        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) dayData.classes.forEach(processClass);
        });
        const currentDay = routine.days.find(d => d.name === dayName);
        if (currentDay) { currentDay.classes.forEach(c => { if (c.id !== currentClassId) processClass(c); }); }
        Object.entries(teacherUsageCounts).forEach(([teacher, count]) => { if (count >= 2) { sharedTeachers.delete(teacher); busyTeachers.add(teacher); } });
        return { busy: busyTeachers, shared: sharedTeachers };
    };

    const getRoomStatus = (dayName, startTime, endTime, currentClassId, currentSubject) => {
        if (!startTime || !endTime) return { busy: new Set(), shared: new Set() };
        const busyRooms = new Set();
        const sharedRooms = new Set();
        const roomUsageCounts = {};
        const processClass = (c) => {
            if (c.room && isTimeOverlap(startTime, endTime, c.startTime, c.endTime)) {
                roomUsageCounts[c.room] = (roomUsageCounts[c.room] || 0) + 1;
                if (currentSubject && c.subject === currentSubject) { sharedRooms.add(c.room); } else { busyRooms.add(c.room); }
            }
        };
        allRoutines.forEach(r => {
            if (r.id === routine.id && isEditMode) return;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) dayData.classes.forEach(processClass);
        });
        const currentDayLocal = routine.days.find(d => d.name === dayName);
        if (currentDayLocal) { currentDayLocal.classes.forEach(c => { if (c.id !== currentClassId) processClass(c); }); }
        Object.entries(roomUsageCounts).forEach(([room, count]) => { if (count >= 2) { sharedRooms.delete(room); busyRooms.add(room); } });
        return { busy: busyRooms, shared: sharedRooms };
    };

    const addClass = () => {
        const currentDayClasses = routine.days.find(d => d.name === activeDay)?.classes || [];
        let newStartTime = routine.shift === '2nd' ? '13:30' : '08:00';
        let newEndTime = routine.shift === '2nd' ? '14:15' : '08:45';
        if (currentDayClasses.length > 0) {
            const lastClass = currentDayClasses[currentDayClasses.length - 1];
            if (lastClass.endTime) {
                newStartTime = lastClass.endTime;
                const [h, m] = newStartTime.split(':').map(Number);
                let totalMinutes = h * 60 + m + 45;
                newEndTime = `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
            }
        }
        setRoutine(prev => ({
            ...prev,
            days: prev.days.map(d => d.name === activeDay ? { ...d, classes: [...d.classes, { id: Math.random().toString(36).substr(2, 9), startTime: newStartTime, endTime: newEndTime, subjectCode: '', subject: '', teacher: '', room: '' }] } : d)
        }));
    };

    const removeClass = (classId) => {
        setRoutine(prev => ({ ...prev, days: prev.days.map(d => d.name === activeDay ? { ...d, classes: d.classes.filter(c => c.id !== classId) } : d) }));
    };

    const updateClass = (classId, field, value) => {
        setRoutine(prev => ({
            ...prev,
            days: prev.days.map(d => d.name === activeDay ? {
                ...d, classes: d.classes.map(c => {
                    if (c.id !== classId) return c;
                    let updates = { [field]: value };
                    if (field === 'subject') {
                        const selectedSubject = subjects.find(s => s.name === value);
                        if (selectedSubject) updates.subjectCode = selectedSubject.code;
                    }
                    return { ...c, ...updates };
                })
            } : d)
        }));
    };

    const handleCodeKeyDown = (e, classId, code) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const foundSubject = subjects.find(s => s.code === code);
            if (foundSubject) {
                updateClass(classId, 'subject', foundSubject.name);
                toast.success(`Subject set to: ${foundSubject.name}`);
            } else {
                toast.error("Subject code not found");
            }
        }
    };

    // --- BATCH GENERATOR HANDLERS ---
    const addTeacherAssignment = (teacher) => {
        setAssignments([...assignments, {
            id: Date.now(),
            teacherId: teacher.id,
            teacherName: teacher.name,
            subjects: [{ id: Date.now() + 1, subject: '', theory: 0, lab: 0, technologies: [], mergedGroups: {} }],
            blockedTimes: []
        }]);
        setTeacherSearchTerm("");
        setShowTeacherDropdown(false);
    };

    const removeTeacherAssignment = (id) => setAssignments(assignments.filter(a => a.id !== id));

    const updateAssignmentSubject = (assignId, subjectId, field, value) => {
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: a.subjects.map(s => s.id === subjectId ? { ...s, [field]: value } : s)
        })));
    };

    const addBlockedTime = (assignId, day, start, end) => {
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, blockedTimes: [...(a.blockedTimes || []), { day, start, end }]
        })));
    };

    const removeBlockedTime = (assignId, index) => {
        setAssignments(assignments.map(a => {
            if (a.id !== assignId) return a;
            const newBlocked = [...(a.blockedTimes || [])];
            newBlocked.splice(index, 1);
            return { ...a, blockedTimes: newBlocked };
        }));
    };

    const addSubjectRow = (assignId) => {
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: [...a.subjects, { id: Date.now(), subject: '', theory: 0, lab: 0, technologies: [], mergedGroups: {} }]
        })));
    };

    const removeSubjectRow = (assignId, subjectId) => {
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: a.subjects.filter(s => s.id !== subjectId)
        })));
    };

    const toggleTechnology = (assignId, subjectId, techId) => {
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: a.subjects.map(s => (s.id !== subjectId ? s : {
                ...s, technologies: s.technologies.includes(techId)
                    ? s.technologies.filter(t => t !== techId)
                    : [...s.technologies, techId]
            }))
        })));
    };

    const handleOpenTechModal = (assignId, subId) => {
        setActiveTechSelection({ assignId, subId });
        setTechModalSearchTerm("");
        setShowTechModal(true);
    };

    const handleToggleTechFromModal = (techId) => {
        if (!activeTechSelection) return;
        toggleTechnology(activeTechSelection.assignId, activeTechSelection.subId, techId);
    };

    const handleSelectAllTech = () => {
        if (!activeTechSelection) return;
        const { assignId, subId } = activeTechSelection;
        const assignment = assignments.find(a => a.id === assignId);
        const subject = assignment?.subjects.find(s => s.id === subId);
        if (!subject) return;

        const filteredOptions = technologyOptions.filter(t => t.label.toLowerCase().includes(techModalSearchTerm.toLowerCase()));
        const allFilteredIds = filteredOptions.map(t => t.id);
        const allSelected = allFilteredIds.every(id => subject.technologies.includes(id));

        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: a.subjects.map(s => {
                if (s.id !== subId) return s;
                let newTechs = [...s.technologies];
                if (allSelected) { newTechs = newTechs.filter(id => !allFilteredIds.includes(id)); }
                else { const toAdd = allFilteredIds.filter(id => !newTechs.includes(id)); newTechs = [...newTechs, ...toAdd]; }
                return { ...s, technologies: newTechs };
            })
        })));
    };

    const handleOpenBatchMerge = (assignId, subId, techId) => {
        setBatchMergeData({ assignId, subId, sourceTechId: techId });
        setBatchMergeSearchTerm("");
        setShowBatchMergeModal(true);
    };

    const handleConfirmBatchMerge = (targetTechId) => {
        if (!batchMergeData) return;
        const { assignId, subId, sourceTechId } = batchMergeData;
        setAssignments(assignments.map(a => (a.id !== assignId ? a : {
            ...a, subjects: a.subjects.map(s => {
                if (s.id !== subId) return s;
                const newTechs = s.technologies.includes(targetTechId) ? s.technologies : [...s.technologies, targetTechId];
                const currentMerges = s.mergedGroups || {};
                const sourceMerges = currentMerges[sourceTechId] || [];
                if (!sourceMerges.includes(targetTechId)) {
                    return { ...s, technologies: newTechs, mergedGroups: { ...currentMerges, [sourceTechId]: [...sourceMerges, targetTechId] } };
                }
                return s;
            })
        })));
        setShowBatchMergeModal(false);
        toast.success("Groups merged successfully!");
    };

    const handleBatchGenerate = async () => {
        try {
            const freshRoutinesResponse = await fetchRoutines();
            const freshRoutines = Array.isArray(freshRoutinesResponse) ? freshRoutinesResponse.map(d => ({ ...d, id: d._id })) : (freshRoutinesResponse.data || []).map(d => ({ ...d, id: d._id }));
            setAllRoutines(freshRoutines);
            const { routines: updatedRoutines, failures } = generateBatchRoutines(assignments, freshRoutines, rooms, subjects);
            let saveCount = 0;
            for (const r of updatedRoutines) {
                if (!r.department || !r.semester || !r.shift || !r.group) continue;
                await createRoutine({ ...r, lastUpdated: Date.now() });
                saveCount++;
            }
            setShowAutoModal(false);
            if (failures.length > 0) { setGenerationFailures(failures); setShowFailuresModal(true); toast.warning(`Generated with issues. ${failures.length} assignments failed.`); }
            else { toast.success(`Generated & Saved ${saveCount} routines successfully!`); }
            const newRoutines = await fetchRoutines();
            setAllRoutines(Array.isArray(newRoutines) ? newRoutines.map(d => ({ ...d, id: d._id })) : (newRoutines.data || []).map(d => ({ ...d, id: d._id })));
        } catch (err) { toast.error(`Batch generation failed: ${err.message}`); }
    };

    const handleManualResolve = async (routineId, item, suggestion) => {
        if (suggestion.type !== 'New Slot') { toast.info("Merge suggestions require manual handling."); return; }

        let routineToUpdate = allRoutines.find(r => r.id === routineId);

        // Fallback: If routine not found (e.g. Temp ID mismatch), try to find by Metadata
        if (!routineToUpdate) {
            const failureRecord = generationFailures.find(f => f.routineId === routineId);
            if (failureRecord && failureRecord.metadata) {
                const { department, semester, shift, group } = failureRecord.metadata;
                routineToUpdate = allRoutines.find(r =>
                    r.department === department &&
                    Number(r.semester) === Number(semester) &&
                    r.shift === shift &&
                    r.group === group
                );
            }
        }

        if (!routineToUpdate) {
            toast.error("Could not find the original routine to update.");
            return;
        }
        const [startTime, endTime] = suggestion.time.split("-");
        const updatedRoutine = {
            ...routineToUpdate,
            days: routineToUpdate.days.map(d => d.name === suggestion.day ? { ...d, classes: [...d.classes, { id: Math.random().toString(36).substr(2, 9), startTime, endTime, subject: item.subject, subjectCode: subjects.find(s => s.name === item.subject)?.code || '', teacher: item.teacher, room: suggestion.room, type: item.type }].sort((a, b) => a.startTime.localeCompare(b.startTime)) } : d),
            lastUpdated: Date.now()
        };
        try {
            await createRoutine(updatedRoutine);
            const freshRoutines = await fetchRoutines();
            setAllRoutines(Array.isArray(freshRoutines) ? freshRoutines.map(d => ({ ...d, id: d._id })) : (freshRoutines.data || []).map(d => ({ ...d, id: d._id })));
            setGenerationFailures(prev => prev.map(fail => fail.routineId !== routineId ? fail : { ...fail, items: fail.items.filter(i => i.subject !== item.subject || i.teacher !== item.teacher || i.type !== item.type) }).filter(fail => fail.items.length > 0));
            if (generationFailures.every(f => f.items.length === 0)) setShowFailuresModal(false);
            toast.success("Class assigned successfully!");
        } catch (err) { toast.error("Failed to assign class."); }
    };

    const handleRefactor = async () => {
        setIsRefactoring(true);
        try {
            const routinesToProcess = (refactorConfig.reduceLab && refactorConfig.targetDept) ? allRoutines.filter(r => r.department === refactorConfig.targetDept) : allRoutines;
            const { routines: updatedRoutines, changes, message } = refactorRoutine(routinesToProcess, { ...refactorConfig, allRoutines: allRoutines, rooms: rooms });
            if (changes === 0) { toast.info("No changes needed."); return; }
            for (const r of updatedRoutines) { await createRoutine({ ...r, lastUpdated: Date.now() }); }
            toast.success(message);
            const newRoutines = await fetchRoutines();
            setAllRoutines(Array.isArray(newRoutines) ? newRoutines.map(d => ({ ...d, id: d._id })) : (newRoutines.data || []).map(d => ({ ...d, id: d._id })));
            setShowRefactorModal(false);
        } catch (err) { toast.error("Refactor failed."); } finally { setIsRefactoring(false); }
    };

    const handleSave = async () => {
        if (!routine.department || !routine.semester || !routine.shift || !routine.group) { toast.error("Please fill in all fields."); return; }
        if (allRoutines.some(r => r.department === routine.department && Number(r.semester) === Number(routine.semester) && r.shift === routine.shift && r.group === routine.group && r.id !== routine.id)) {
            toast.error("Routine already exists!"); return;
        }
        setSaving(true);
        try {
            const res = await createRoutine({ ...routine, lastUpdated: Date.now() });
            toast.success("Routine saved!");
            const fresh = await fetchRoutines();
            const mapped = Array.isArray(fresh) ? fresh.map(d => ({ ...d, id: d._id })) : (fresh.data || []).map(d => ({ ...d, id: d._id }));
            setAllRoutines(mapped);
            if (!isEditMode) { const newOne = mapped.find(r => r.department === routine.department && r.semester === routine.semester && r.shift === routine.shift && r.group === routine.group); if (newOne) { setRoutine(newOne); setIsEditMode(true); } }
        } catch (error) { toast.error("Save failed."); } finally { setSaving(false); }
    };

    // Calculate groups for select
    const groupsFiltered = useMemo(() => {
        if (routine.shift === "1st") return routine.department.toLowerCase().includes('civil') ? ["A1", "B1", "C1"] : ["A1", "B1"];
        if (routine.shift === "2nd") return routine.department.toLowerCase().includes('civil') ? ["A2", "B2", "C2"] : ["A2", "B2"];
        return GROUPS;
    }, [routine.shift, routine.department]);

    return (
        <div className='bg-gray-50 dark:bg-gray-950 min-h-screen'>
            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                {/* Custom Header with Main Controls */}
                <ControlHeader
                    isEditMode={isEditMode}
                    onBack={onBack}
                    onAutoGenerate={() => setShowShiftSelectionModal(true)}
                    onRefactorAll={() => setShowRefactorModal(true)}
                    isPreviewMode={isPreviewMode}
                    setIsPreviewMode={setIsPreviewMode}
                    onSave={handleSave}
                    saving={saving}
                />

                {!isPreviewMode ? (
                    <div className="animate-in fade-in duration-500">
                        {/* Configuration & Filter Panels */}
                        <ConfigPanels
                            routine={routine}
                            handleMetaChange={handleMetaChange}
                            isEditMode={isEditMode}
                            departments={departments}
                            teacherFilterDept={teacherFilterDept}
                            setTeacherFilterDept={setTeacherFilterDept}
                            roomFilterType={roomFilterType}
                            setRoomFilterType={setRoomFilterType}
                            roomFilterLocation={roomFilterLocation}
                            setRoomFilterLocation={setRoomFilterLocation}
                            roomFilterDept={roomFilterDept}
                            setRoomFilterDept={setRoomFilterDept}
                            groupsFiltered={groupsFiltered}
                        />

                        {/* Day Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${activeDay === day ? 'bg-[#FF5C35] text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        {/* Class Editor */}
                        <ClassEditor
                            activeDay={activeDay}
                            routine={routine}
                            addClass={addClass}
                            updateClass={updateClass}
                            removeClass={removeClass}
                            handleCodeKeyDown={handleCodeKeyDown}
                            getTeacherStatus={getTeacherStatus}
                            getRoomStatus={getRoomStatus}
                            subjects={subjects}
                            teachers={teachers}
                            filteredTeachers={filteredTeachers}
                            rooms={rooms}
                            filteredRooms={filteredRooms}
                            toast={toast}
                        />
                    </div>
                ) : (
                    /* Routine Preview Component */
                    <RoutinePreview routine={routine} />
                )}

                {/* --- MODALS --- */}
                <ShiftSelectionModal
                    show={showShiftSelectionModal}
                    onClose={() => setShowShiftSelectionModal(false)}
                    onSelect={(shift) => { setBatchShift(shift); setShowShiftSelectionModal(false); setShowAutoModal(true); }}
                />

                <RefactorModal
                    show={showRefactorModal}
                    onClose={() => setShowRefactorModal(false)}
                    onRefactor={handleRefactor}
                    config={refactorConfig}
                    setConfig={setRefactorConfig}
                    departments={departments}
                    isRefactoring={isRefactoring}
                />

                <FailuresModal
                    show={showFailuresModal}
                    onClose={() => setShowFailuresModal(false)}
                    failures={generationFailures}
                    onManualResolve={handleManualResolve}
                />

                <AutoGenerateModal
                    show={showAutoModal}
                    onClose={() => setShowAutoModal(false)}
                    batchShift={batchShift}
                    teacherSearchTerm={teacherSearchTerm}
                    setTeacherSearchTerm={setTeacherSearchTerm}
                    showTeacherDropdown={showTeacherDropdown}
                    setShowTeacherDropdown={setShowTeacherDropdown}
                    teachers={teachers}
                    addTeacherAssignment={addTeacherAssignment}
                    assignments={assignments}
                    removeTeacherAssignment={removeTeacherAssignment}
                    removeBlockedTime={removeBlockedTime}
                    addBlockedTime={addBlockedTime}
                    subjects={subjects}
                    updateAssignmentSubject={updateAssignmentSubject}
                    technologyOptions={technologyOptions}
                    handleOpenBatchMerge={handleOpenBatchMerge}
                    handleOpenTechModal={handleOpenTechModal}
                    removeSubjectRow={removeSubjectRow}
                    addSubjectRow={addSubjectRow}
                    toggleTechnology={toggleTechnology}
                    handleBatchGenerate={handleBatchGenerate}
                />

                <TechSelectionModal
                    show={showTechModal}
                    onClose={() => setShowTechModal(false)}
                    activeTechSelection={activeTechSelection}
                    techModalSearchTerm={techModalSearchTerm}
                    setTechModalSearchTerm={setTechModalSearchTerm}
                    technologyOptions={technologyOptions}
                    handleSelectAllTech={handleSelectAllTech}
                    handleToggleTechFromModal={handleToggleTechFromModal}
                    assignments={assignments}
                />

                <BatchMergeModal
                    show={showBatchMergeModal}
                    onClose={() => setShowBatchMergeModal(false)}
                    batchMergeData={batchMergeData}
                    batchMergeSearchTerm={batchMergeSearchTerm}
                    setBatchMergeSearchTerm={setBatchMergeSearchTerm}
                    technologyOptions={technologyOptions}
                    handleConfirmBatchMerge={handleConfirmBatchMerge}
                />
            </div>
        </div>
    );
}
