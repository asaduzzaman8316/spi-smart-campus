export const generateRoutine = (
    currentRoutineConfig, // { department, semester, shift, group }
    loadItems,            // [{ subject, teacher, theoryCount, labCount }]
    constraints,          // [{ teacher, day, startTime, endTime }] (Manual blocks)
    allRoutines,          // All existing routines from DB
    rooms,                // List of room objects
    teachers,             // List of teacher objects
    subjects,             // List of subject objects
    options = {}          // { combineClasses: boolean, reduceLab: boolean, linkedRoutines: [] }
) => {
    // 1. Deep copy basic routine structure or use existing if provided in allRoutines logic?
    // Actually, this function builds a FRESH days array usually.
    // But for Batching, we migth want to APPEND to existing?
    // The current logic builds 'generatedDays' from scratch.

    // Check if we already have classes for this routine in 'allRoutines' passed in?
    // If so, we should probably start with THAT state?
    // The current architecture assumes we are generating from scratch or replacing.
    // BUT user wants to ADD load.
    // Let's modify to: Start with existing days if available in currentRoutineConfig (if it has days).

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    let generatedDays;

    // Initialize with existing data if present to support "Adding" load rather than overwriting
    if (currentRoutineConfig.days && currentRoutineConfig.days.length > 0) {
        // Deep copy existing days
        generatedDays = JSON.parse(JSON.stringify(currentRoutineConfig.days));
    } else {
        generatedDays = days.map(d => ({ name: d, classes: [] }));
    }

    // Helper: Standard Time Slots
    const getSlots = (shift) => {
        if (shift === "1st") {
            return [
                { start: "08:00", end: "08:45" },
                { start: "08:45", end: "09:30" },
                { start: "09:30", end: "10:15" },
                { start: "10:15", end: "11:00" },
                { start: "11:00", end: "11:45" },
                { start: "11:45", end: "12:30" },
                { start: "12:30", end: "13:15" },
            ];
        } else {
            return [
                { start: "13:30", end: "14:15" },
                { start: "14:15", end: "15:00" },
                { start: "15:00", end: "15:45" },
                { start: "15:45", end: "16:30" },
                { start: "16:30", end: "17:15" },
                { start: "17:15", end: "18:00" },
                { start: "18:00", end: "18:45" },
            ];
        }
    };

    const slots = getSlots(currentRoutineConfig.shift);

    // Helpers for Conflict Checking
    const isOverlapping = (s1, e1, s2, e2) => {
        const getMin = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        return Math.max(getMin(s1), getMin(s2)) < Math.min(getMin(e1), getMin(e2));
    };

    const isTeacherBusy = (teacherName, dayName, start, end, subjectToMerge = null, typeToMerge = null) => {
        // 1. Check User Constraints
        const userConstraint = constraints.find(c =>
            c.teacher === teacherName &&
            c.day === dayName &&
            isOverlapping(c.startTime, c.endTime, start, end)
        );
        if (userConstraint) return true;

        // 2. Check Other Routines
        for (const r of allRoutines) {
            // Skip if it's the schedule we are editing
            if (r.id === currentRoutineConfig.id) continue;

            const dayData = r.days.find(d => d.name === dayName);
            if (!dayData) continue;

            for (const cls of dayData.classes) {
                if (cls.teacher === teacherName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                    // MERGE LOGIC: If same subject, same teacher, SAME TYPE, and combineClasses is enabled
                    if (options.combineClasses && subjectToMerge && cls.subject === subjectToMerge) {
                        // Strict Type Check for Merge (e.g. Theory with Theory only)
                        if (typeToMerge && cls.type !== typeToMerge) {
                            return true; // Different types cannot merge (e.g. Lab vs Theory)
                        }

                        return false; // Valid merge
                    }
                    return true; // Busy with something else
                }
            }
        }

        // 3. Check Current Generated Local State
        const currentDay = generatedDays.find(d => d.name === dayName);
        for (const cls of currentDay.classes) {
            if (cls.teacher === teacherName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                return true;
            }
        }

        return false;
    };

    const isRoomBusy = (roomName, dayName, start, end) => {
        // 1. Check Other Routines
        for (const r of allRoutines) {
            if (r.id === currentRoutineConfig.id) continue;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) {
                for (const cls of dayData.classes) {
                    if (cls.room === roomName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                        return true;
                    }
                }
            }
        }
        // 2. Check Current Generated Local State
        const currentDay = generatedDays.find(d => d.name === dayName);
        for (const cls of currentDay.classes) {
            if (cls.room === roomName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                return true;
            }
        }
        return false;
    };

    const isGroupBusy = (dayName, start, end) => {
        // Check Current Generated Local State (which now includes pre-fetched existing classes)
        const currentDay = generatedDays.find(d => d.name === dayName);
        if (!currentDay) return false;

        for (const cls of currentDay.classes) {
            if (isOverlapping(cls.startTime, cls.endTime, start, end)) {
                return true;
            }
        }
        return false;
    };

    // Helper to find existing room invocation if ANY to merge with
    const findMergeRoom = (teacherName, subjectName, type, dayName, start, end) => {
        if (!options.combineClasses) return null;
        for (const r of allRoutines) {
            if (r.id === currentRoutineConfig.id) continue;
            const dayData = r.days.find(d => d.name === dayName);
            if (!dayData) continue;
            for (const cls of dayData.classes) {
                // Must match Type as well
                if (cls.teacher === teacherName &&
                    cls.subject === subjectName &&
                    cls.type === type &&
                    isOverlapping(cls.startTime, cls.endTime, start, end)) {
                    return cls.room;
                }
            }
        }
        return null;
    }

    // --- PHASE 1: Identify Merging Opportunities ---
    // DISABLED: User requested UNIQ ROOMS for every class during auto-generation.
    // "not combine the class in autocreate routine time"

    // 4. Check Advanced Constraint: Separation of Theory/Lab for same Subject
    const isConstraintViolated = (dayName, subjectName, totalSubjectLoad = 0) => {
        // STRICT RULE: A subject can appear ONLY ONCE per day (Theory OR Lab).
        const day = generatedDays.find(d => d.name === dayName);
        if (!day) return false;

        const classesOfSubject = day.classes.filter(c => c.subject === subjectName);

        // If any class of this subject exists, it's a violation.
        return classesOfSubject.length >= 1;
    };

    // Helper: Check Linked Routines (For Combined Classes)
    const isLinkedRoutineBusy = (dayName, start, end) => {
        if (!options.linkedRoutines || options.linkedRoutines.length === 0) return false;

        for (const routine of options.linkedRoutines) {
            const day = routine.days.find(d => d.name === dayName);
            if (!day) continue;
            // Check if ANY class overlaps
            if (day.classes.some(c => isOverlapping(c.startTime, c.endTime, start, end))) {
                return true;
            }
        }
        return false;
    };

    // Helper to add class
    const addClass = (dayName, slot, loadItem, room, isMerge = false) => {
        const subjectObj = subjects.find(s => s.name === loadItem.subject);
        const newClass = {
            id: Math.random().toString(36).substr(2, 9),
            startTime: slot.start,
            endTime: slot.end,
            subject: loadItem.subject,
            subjectCode: subjectObj ? subjectObj.code : '',
            teacher: loadItem.teacher,
            room: room,
            isMerged: isMerge,
            type: loadItem.type || 'Theory' // Preserve type
        };
        const day = generatedDays.find(d => d.name === dayName);
        day.classes.push(newClass);
        // Sort classes by time
        day.classes.sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });
    };

    // --- Building Constraint Logic ---
    const getRoomScore = (room, department, isLab, previousClassRoom, subjectDepartment = null) => {
        let score = 0;
        const location = room.location || ""; // e.g. "Computer Building", "Academic Building" (Admin)

        // Normalization for robust matching
        const norm = (str) => str ? str.toString().trim().toLowerCase() : "";
        const rDept = norm(room.department);
        const sDept = norm(subjectDepartment);
        const cDept = norm(department); // Routine Department

        // *** NEW: Combined Class Prioritization (Big Capacity) ***
        const isCombinedAllocation = options.linkedRoutines && options.linkedRoutines.length > 0;

        if (isCombinedAllocation) {
            // If we are merging, capacity is KING.
            // We want the biggest room available.
            // Add raw capacity to score to act as tie breaker or main driver.
            if (room.capacity) {
                score += room.capacity * 2;
            }
        }

        // 1. THEORY Logic
        if (!isLab) {
            const isCstOrEmt = ["computer", "electromedical"].some(d => cDept.includes(d));

            if (isCstOrEmt) {
                // Priority: Computer Building
                if (location.includes("Computer")) score += 50;
                else if (location.includes("Academic")) score += 10;
            } else {
                // Non-CST/EMT
                // Priority: Academic or Main
                if (location.includes("Academic")) score += 50;
                else if (location.includes("Computer")) score += 0;
                else score += 20;
            }

            // Department Preference (Fuzzy Match)
            // If room matches routine department
            if (rDept === cDept || (rDept && cDept && rDept.includes(cDept))) score += 100;

            // Previous class continuity
            if (previousClassRoom && room.name === previousClassRoom) score += 5;

        }
        // 2. LAB Logic
        else {
            // Strict Dept Matching for Labs usually?
            // Or at least "isLab" must be true
            if (!room.isLab) return -1000;

            // Logic Adjustment: Match Subject Department with Room Department
            // "if the depertment lab is small (same) no problem asign this room"

            // Check for Subject Department Match first (Priority 1)
            const subjectMatch = sDept && (rDept === sDept || rDept.includes(sDept) || sDept.includes(rDept));

            // Check for Routine Department Match (Priority 2)
            const routineMatch = cDept && (rDept === cDept || rDept.includes(cDept) || cDept.includes(rDept));

            if (subjectMatch) {
                score += 200; // Best match: Room matches Subject (e.g. Java -> Computer Lab)
            } else if (routineMatch) {
                score += 50; // Backup: Room matches Class Department
            }
        }

        return score;
    };


    const toPlace = [];
    loadItems.forEach(item => {
        // Theory
        for (let i = 0; i < item.theoryCount; i++) {
            toPlace.push({ ...item, type: 'Theory', duration: 1, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
        }
        // Lab (New Logic: 2->2, 3->3, 4->2+2, 6->3+3)
        if (item.labCount > 0) {
            if (item.labCount === 2) {
                toPlace.push({ ...item, type: 'Lab', duration: 2, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
            } else if (item.labCount === 3) {
                toPlace.push({ ...item, type: 'Lab', duration: 3, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
            } else if (item.labCount === 4) {
                toPlace.push({ ...item, type: 'Lab', duration: 2, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
                toPlace.push({ ...item, type: 'Lab', duration: 2, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
            } else if (item.labCount === 6) {
                toPlace.push({ ...item, type: 'Lab', duration: 3, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
                toPlace.push({ ...item, type: 'Lab', duration: 3, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
            } else {
                // Fallback for other loads (e.g. 5, 8). Fill with 3s, remainder 2s or 1s.
                let remaining = item.labCount;
                while (remaining > 0) {
                    if (remaining >= 3) {
                        toPlace.push({ ...item, type: 'Lab', duration: 3, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
                        remaining -= 3;
                    } else if (remaining === 2) {
                        toPlace.push({ ...item, type: 'Lab', duration: 2, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
                        remaining -= 2;
                    } else {
                        // remaining 1. Force 1? Or append to previous? 
                        // Usually labs are min 2. But we'll add a 1 period lab if leftover.
                        toPlace.push({ ...item, type: 'Lab', duration: 1, id: Math.random(), totalLoad: item.theoryCount + item.labCount });
                        remaining -= 1;
                    }
                }
            }
        }
    });

    // Prioritize Labs (Harder to place)
    toPlace.sort((a, b) => {
        if (a.type === 'Lab' && b.type !== 'Lab') return -1;
        if (a.type !== 'Lab' && b.type === 'Lab') return 1;
        return 0;
    });

    const labs = toPlace.filter(x => x.type === 'Lab');
    const theories = toPlace.filter(x => x.type === 'Theory');

    // Track items that couldn't be placed
    const unplacedItems = [];

    labs.forEach(lab => {
        let placed = false;
        const slotsNeeded = lab.duration;

        // Strategy: 
        // 1. Try days that DO NOT have a lab yet.
        // 2. If all days have a lab, DO NOT AUTO-ASSIGN (per user request: "show a model").
        //    Instead, we leave it as unplaced with a specific reason handled by UI.

        // Sort days: Days with NO Lab first.
        const sortedDays = [...days].sort((a, b) => {
            const dayA = generatedDays.find(d => d.name === a);
            const dayB = generatedDays.find(d => d.name === b);
            const hasLabA = dayA.classes.some(c => c.type === 'Lab');
            const hasLabB = dayB.classes.some(c => c.type === 'Lab');
            if (hasLabA === hasLabB) return 0;
            return hasLabA ? 1 : -1; // No Lab comes first
        });

        // Loop days
        for (const dayName of sortedDays) {
            if (placed) break;

            const dayObj = generatedDays.find(d => d.name === dayName);
            const hasExistingLab = dayObj.classes.some(c => c.type === 'Lab');

            // SKIP if day already has a lab (Enforce distribution)
            // If all days have labs, this loop will finish with placed=false, 
            // result in unplaced item, effectively prompting user intervention via "Failures"
            if (hasExistingLab) continue;

            // CONSTRAINT CHECK: Check Load Constraint
            if (isConstraintViolated(dayName, lab.subject, lab.totalLoad)) continue;

            for (let s = 0; s <= slots.length - slotsNeeded; s++) {
                const startSlot = slots[s];
                const endSlot = slots[s + slotsNeeded - 1]; // Inclusive

                // Check if Group is Busy (Self-Overlap)
                if (isGroupBusy(dayName, startSlot.start, endSlot.end)) continue;

                // Check Teacher Availability for WHOLE block
                let teacherConflict = false;
                for (let check = 0; check < slotsNeeded; check++) {
                    const checkSlot = slots[s + check];
                    if (isTeacherBusy(lab.teacher, dayName, checkSlot.start, checkSlot.end, lab.subject, lab.type)) {
                        teacherConflict = true;
                        break;
                    }
                }
                if (teacherConflict) continue;

                // Linked Routine Check
                if (isLinkedRoutineBusy(dayName, startSlot.start, endSlot.end)) continue;

                // Check Merge Opportunity First
                let chosenRoomName = null;
                let isMerged = false;

                const subjectObj = subjects.find(s => s.name === lab.subject);
                const subjectDept = subjectObj ? subjectObj.department : null;

                const mergeRoom = findMergeRoom(lab.teacher, lab.subject, lab.type, dayName, startSlot.start, endSlot.end);

                if (mergeRoom) {
                    chosenRoomName = mergeRoom;
                    isMerged = true;
                } else {
                    // Find Room
                    let bestRoom = null;
                    let bestScore = -10000;

                    const availableRooms = rooms.filter(r => r.isLab);

                    for (const room of availableRooms) {
                        let roomConflict = false;
                        for (let check = 0; check < slotsNeeded; check++) {
                            const checkSlot = slots[s + check];
                            if (isRoomBusy(room.name || room.number, dayName, checkSlot.start, checkSlot.end)) {
                                roomConflict = true;
                                break;
                            }
                        }
                        if (roomConflict) continue;

                        const score = getRoomScore(room, currentRoutineConfig.department, true, null, subjectDept);
                        if (score > bestScore) {
                            bestScore = score;
                            bestRoom = room;
                        }
                    }
                    if (bestRoom) chosenRoomName = bestRoom.name || bestRoom.number;
                }

                if (chosenRoomName) {
                    addClass(dayName, { start: startSlot.start, end: endSlot.end }, lab, chosenRoomName, isMerged);
                    placed = true;
                    break;
                }
            }
        }

        /* 
           REMOVED: Fallback logic (reducing labs) and Must-Assign Fallback.
           Per requirement, if we can't find a "One Lab Per Day" slot or free slot, we STOP and leave it unplaced
           so the user is prompted (by seeing it in the unplaced list) to manually assign.
        */

        if (!placed) unplacedItems.push({ ...lab, reason: 'No Lab Slot/Teacher Busy' });
    });

    theories.forEach(theory => {
        let placed = false;

        // Sort days by current load (Ascending) to balance the schedule
        // This ensures we try to place the theory class in the day with the FEWEST classes first.
        const sortedDaysForTheory = [...days].sort((a, b) => {
            const dayA = generatedDays.find(d => d.name === a);
            const dayB = generatedDays.find(d => d.name === b);
            return dayA.classes.length - dayB.classes.length;
        });

        for (const day of sortedDaysForTheory) {
            if (placed) break;
            // CONSTRAINT CHECK: Check Load Constraint
            if (isConstraintViolated(day, theory.subject, theory.totalLoad)) continue;

            for (const slot of slots) {
                if (placed) break;

                // Check if Group is Busy (Self-Overlap) - ADDED FIX
                if (isGroupBusy(day, slot.start, slot.end)) continue;

                // Teacher Check
                if (isTeacherBusy(theory.teacher, day, slot.start, slot.end, theory.subject)) continue;

                // Linked Routine Check
                if (isLinkedRoutineBusy(day, slot.start, slot.end)) continue;

                // Merge Check
                let chosenRoomName = null;
                let isMerged = false;
                const mergeRoom = findMergeRoom(theory.teacher, theory.subject, theory.type, day, slot.start, slot.end);

                const subjectObj = subjects.find(s => s.name === theory.subject);
                const subjectDept = subjectObj ? subjectObj.department : null;

                if (mergeRoom) {
                    chosenRoomName = mergeRoom;
                    isMerged = true;
                } else {
                    // Find Room
                    let bestRoom = null;
                    let bestScore = -10000;

                    const availableRooms = rooms.filter(r => !r.isLab);

                    for (const room of availableRooms) {
                        if (isRoomBusy(room.name || room.number, day, slot.start, slot.end)) continue;
                        const score = getRoomScore(room, currentRoutineConfig.department, false, null, subjectDept);
                        if (score > bestScore) {
                            bestScore = score;
                            bestRoom = room;
                        }
                    }
                    if (bestRoom) chosenRoomName = bestRoom.name || bestRoom.number;
                }

                if (chosenRoomName) {
                    addClass(day, slot, theory, chosenRoomName, isMerged);
                    placed = true;
                }
            }
        }

        // Fallback 1: Try Reducing Existing Labs of SAME subject (3 -> 2 periods) to free up space
        if (!placed) {
            // Helper to reduce logic
            const reduceLabs = () => {
                let reduced = false;
                generatedDays.forEach(d => {
                    d.classes.forEach(c => {
                        if (c.subject === theory.subject && c.type === 'Lab') {
                            // Check duration. 3 periods (135m) -> 2 periods (90m)
                            // We need to map time to slots to be precise, or just check standard durations.
                            // 1st Shift: 
                            // 3 periods: 08:00-10:15 (135m), 10:15-12:30 (135m).
                            // 2 periods: 08:00-09:30, 10:15-11:45.
                            // We need to find the "end slot" and move it back one.

                            const startIdx = slots.findIndex(s => s.start === c.startTime);
                            const endIdx = slots.findIndex(s => s.end === c.endTime);

                            if (startIdx !== -1 && endIdx !== -1) {
                                const duration = endIdx - startIdx + 1;
                                if (duration === 3) {
                                    // Reduce to 2
                                    const newEndSlot = slots[startIdx + 1]; // Start + 1 = 2nd slot
                                    if (newEndSlot) {
                                        c.endTime = newEndSlot.end;
                                        reduced = true;
                                    }
                                }
                            }
                        }
                    });
                });
                return reduced;
            };

            if (reduceLabs()) {
                // Retry Placement Logic (Recursion or simpler retry?)
                // Simple Retry of the main loop logic for this item
                for (const day of sortedDaysForTheory) {
                    if (placed) break;
                    if (isConstraintViolated(day, theory.subject, theory.totalLoad)) continue;

                    for (const slot of slots) {
                        if (placed) break;
                        // Check if Group is Busy (Self-Overlap) - ADDED FIX
                        if (isGroupBusy(day, slot.start, slot.end)) continue;

                        if (isTeacherBusy(theory.teacher, day, slot.start, slot.end, theory.subject, theory.type)) continue;
                        if (isLinkedRoutineBusy(day, slot.start, slot.end)) continue;

                        // Strict Room Check only now
                        let chosenRoomName = null;
                        const availableRooms = rooms.filter(r => !r.isLab);
                        for (const room of availableRooms) {
                            if (isRoomBusy(room.name || room.number, day, slot.start, slot.end)) continue;
                            const score = getRoomScore(room, currentRoutineConfig.department, false, null); // Simplified score
                            if (score > -100) { // Just valid
                                chosenRoomName = room.name || room.number;
                                break;
                            }
                        }

                        if (chosenRoomName) {
                            addClass(day, slot, theory, chosenRoomName, false);
                            placed = true;
                        }
                    }
                }
            }
        }

        // Final Fallback: "Must be assigned" - If room is the only blocker, try 'Unplaced'
        if (!placed) {
            for (const day of sortedDaysForTheory) {
                if (placed) break;
                if (isConstraintViolated(day, theory.subject, theory.totalLoad)) continue;
                if (isConstraintViolated(day, theory.subject, theory.totalLoad)) continue;
                for (const slot of slots) {
                    // Check if Group is Busy (Self-Overlap) - ADDED FIX
                    if (isGroupBusy(day, slot.start, slot.end)) continue;

                    if (isTeacherBusy(theory.teacher, day, slot.start, slot.end, theory.subject, theory.type)) continue;
                    if (isLinkedRoutineBusy(day, slot.start, slot.end)) continue;
                    // Force Place
                    addClass(day, slot, theory, "Unplaced", false);
                    placed = true;
                    break;
                }
            }
        }

        if (!placed) unplacedItems.push({ ...theory, reason: 'No Theory Slot/Teacher Busy' });
    });

    // --- Generate Merge Suggestions & Available Options for Unplaced Items ---
    const failuresWithSuggestions = unplacedItems.map(item => {
        const suggestions = [];

        // 1. Merge Suggestions: Look for existing class in OTHER routines
        allRoutines.forEach(r => {
            if (r.shift !== currentRoutineConfig.shift) return;

            r.days.forEach(d => {
                d.classes.forEach(c => {
                    if (c.teacher === item.teacher && c.subject === item.subject) {
                        suggestions.push({
                            routine: `${r.department} ${r.semester}${r.shift === '1st' ? 'st' : 'nd'} (${r.group})`,
                            day: d.name,
                            time: `${c.startTime}-${c.endTime}`,
                            room: c.room,
                            type: 'Merge'
                        });
                    }
                });
            });
        });

        // 2. New Slot Suggestions: Check if we can fit it in CURRENT routine (ignoring "1 Lab Per Day" rule)
        // This answers the user request: "show the day where can assign... then user select the day"
        if (item.type === 'Lab') {
            const slotsNeeded = item.duration || (item.labCount === 2 ? 2 : 3); // Default based on load if duration missing

            days.forEach(dayName => {
                // Check if this day actually has space/teacher/room availability
                // We re-run the check logic but WITHOUT:
                // a) "One Lab Per Day" check (we want to suggest it even if it breaks this soft rule)
                // b) "Duplicate Subject" check is strict, but maybe we show it as option anyway? 
                //    Actually user said "same subject same day practical and theory... can not assign".
                //    But "assign 2 practical class in same day" (same subject?) -> usually different subjects.
                //    Let's assume different subject.

                // Constraint Check (Strict Subject/Type uniqueness)
                // If it violates strict constraint, we probably shouldn't suggest it unless it's the SAME subject lab we are trying to place?
                // Actually if unplaced item is "Subject A", and "Subject A" is already on Monday, we shouldn't suggest Monday.
                if (isConstraintViolated(dayName, item.subject, item.totalLoad)) return;

                const day = generatedDays.find(d => d.name === dayName);
                if (!day) return;

                for (let s = 0; s <= slots.length - slotsNeeded; s++) {
                    const startSlot = slots[s];
                    const endSlot = slots[s + slotsNeeded - 1];

                    if (isGroupBusy(dayName, startSlot.start, endSlot.end)) continue;

                    // Teacher Check (Full block)
                    let teacherBusy = false;
                    for (let k = 0; k < slotsNeeded; k++) {
                        const chk = slots[s + k];
                        if (isTeacherBusy(item.teacher, dayName, chk.start, chk.end, item.subject, item.type)) {
                            teacherBusy = true;
                            break;
                        }
                    }
                    if (teacherBusy) continue;

                    if (isLinkedRoutineBusy(dayName, startSlot.start, endSlot.end)) continue;

                    // Room Check (Find ANY valid room)
                    const availableRooms = rooms.filter(r => r.isLab);
                    let bestRoom = null;
                    let bestScore = -10000;

                    const subjectObj = subjects.find(s => s.name === item.subject);
                    const subjectDept = subjectObj ? subjectObj.department : null;

                    for (const room of availableRooms) {
                        let roomBusy = false;
                        for (let k = 0; k < slotsNeeded; k++) {
                            const chk = slots[s + k];
                            if (isRoomBusy(room.name || room.number, dayName, chk.start, chk.end)) {
                                roomBusy = true;
                                break;
                            }
                        }
                        if (!roomBusy) {
                            // Use same scoring logic as main placement
                            const score = getRoomScore(room, currentRoutineConfig.department, true, null, subjectDept);
                            if (score > bestScore) {
                                bestScore = score;
                                bestRoom = room;
                            }
                        }
                    }

                    if (bestRoom) {
                        // Found a valid slot with the BEST room!
                        suggestions.push({
                            routine: "Available Slot",
                            day: dayName,
                            time: `${startSlot.start}-${endSlot.end}`,
                            room: bestRoom.name || bestRoom.number,
                            type: 'New Slot'
                        });
                        // Don't show every possible slot for the day, maybe just the first one per day is enough?
                        // Or show all? Let's show first one per day to avoid spam.
                        break;
                    }

                }

            });
        }

        return {
            ...item,
            reason: suggestions.length > 0 ? "Options Available (Manual Select)" : "No Time / Teacher Busy",
            suggestions: suggestions
        };
    });

    return { generatedDays, unplacedItems: failuresWithSuggestions };
};


// --- BATCH GENERATOR ---
export const generateBatchRoutines = (
    assignments, // [{ teacherId, teacherName, subjects: [{ subject, technologies: ['Dept|Sem|Shift|Grp'], mergedGroups: {}, theory, lab }] }]
    allExistingRoutines, // Array of all routines in DB
    rooms,
    subjects
) => {
    // 1. Create a working copy of all routines
    let workingRoutines = JSON.parse(JSON.stringify(allExistingRoutines));
    let allFailures = [];

    // Helper to find or create
    const getRoutine = (techId) => {
        const [dept, sem, shift, grp] = techId.split('|');

        // Robust Matching: Trim whitespace and case-insensitive check for strings
        let routine = workingRoutines.find(r =>
            r.department.trim().toLowerCase() === dept.trim().toLowerCase() &&
            Number(r.semester) === Number(sem) && // Ensure number comparison
            r.shift === shift && // Shift usually matches exactly (dropdown)
            r.group === grp      // Group usually matches exactly
        );

        if (!routine) {
            routine = {
                id: `TEMP_${Math.random()}`, // Temp ID
                department: dept,
                semester: Number(sem),
                shift: shift,
                group: grp,
                days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map(d => ({ name: d, classes: [] })),
                isNew: true
            };
            workingRoutines.push(routine);
        }
        return routine;
    };

    // 2. Iterate Assignments
    for (const assignment of assignments) {
        for (const sub of assignment.subjects) {
            // Build the load item
            const loadItem = {
                subject: sub.subject,
                teacher: assignment.teacherName,
                theoryCount: sub.theory,
                labCount: sub.lab
            };

            const processedTechIds = new Set();

            // 3. Process Technologies (Handling Merges)
            for (const techId of sub.technologies) {
                if (processedTechIds.has(techId)) continue;

                // Identify Partners
                const primaryRoutine = getRoutine(techId);
                const partners = sub.mergedGroups && sub.mergedGroups[techId] ? sub.mergedGroups[techId] : [];

                // Get Partner Routines
                const linkedRoutines = [];
                partners.forEach(pid => {
                    const r = getRoutine(pid);
                    if (r) linkedRoutines.push(r);
                });

                // Mark processed
                processedTechIds.add(techId);
                partners.forEach(pid => processedTechIds.add(pid));

                // Prepare Constraints from Blocked Times
                const constraints = (assignment.blockedTimes || []).map(bt => ({
                    teacher: assignment.teacherName,
                    day: bt.day,
                    startTime: bt.start,
                    endTime: bt.end
                }));

                // 4. Generate Schedule for Primary (checking conflicts with Partners)
                const { generatedDays, unplacedItems } = generateRoutine(
                    primaryRoutine,
                    [loadItem], // Only add this subject's load
                    constraints, // Pass constraints
                    workingRoutines,
                    rooms,
                    [],
                    subjects,
                    { linkedRoutines: linkedRoutines } // Pass linked routines
                );

                // 5. Update Primary
                primaryRoutine.days = generatedDays;

                // 6. Sync Generated Classes to Partners
                if (linkedRoutines.length > 0) {
                    generatedDays.forEach(day => {
                        const newClassesForThisSubject = day.classes.filter(c => c.subject === loadItem.subject && c.teacher === loadItem.teacher);

                        linkedRoutines.forEach(partner => {
                            const partnerDay = partner.days.find(d => d.name === day.name);
                            if (partnerDay) {
                                newClassesForThisSubject.forEach(cls => {
                                    // Check if partner already has this class?
                                    // Rely on unique ID creation: we are appending NEW classes.
                                    // Clone class and set isMerged = true
                                    const clonedClass = { ...cls, id: Math.random().toString(36).substr(2, 9), isMerged: true };
                                    partnerDay.classes.push(clonedClass);
                                    partnerDay.classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
                                });
                            }
                        });
                    });
                }

                // Collect failures
                if (unplacedItems && unplacedItems.length > 0) {
                    allFailures.push({
                        routineId: primaryRoutine.id || primaryRoutine._id, // Ensure we have the ID
                        routine: `${primaryRoutine.department} - ${primaryRoutine.semester} (${primaryRoutine.group})`,
                        metadata: {
                            department: primaryRoutine.department,
                            semester: primaryRoutine.semester,
                            shift: primaryRoutine.shift,
                            group: primaryRoutine.group
                        },
                        items: unplacedItems
                    });
                }
            }
        }
    }

    return { routines: workingRoutines, failures: allFailures };
};

export const refactorRoutine = (routines, config) => {
    // config: { reduceLab: boolean, targetDept: string, allRoutines: [] }
    const refactoredRoutines = JSON.parse(JSON.stringify(routines));
    let totalChanges = 0;

    const getSlots = (shift) => {
        if (shift === "1st") {
            return [
                { start: "08:00", end: "08:45" }, { start: "08:45", end: "09:30" },
                { start: "09:30", end: "10:15" }, { start: "10:15", end: "11:00" },
                { start: "11:00", end: "11:45" }, { start: "11:45", end: "12:30" },
                { start: "12:30", end: "13:15" },
            ];
        } else {
            return [
                { start: "13:30", end: "14:15" }, { start: "14:15", end: "15:00" },
                { start: "15:00", end: "15:45" }, { start: "15:45", end: "16:30" },
                { start: "16:30", end: "17:15" }, { start: "17:15", end: "18:00" },
                { start: "18:00", end: "18:45" },
            ];
        }
    };

    const isOverlapping = (s1, e1, s2, e2) => {
        const getMin = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        return Math.max(getMin(s1), getMin(s2)) < Math.min(getMin(e1), getMin(e2));
    };

    const isSlotBusy = (teacher, room, day, start, end, ignoreRoutineId) => {
        for (const r of config.allRoutines) {
            // We consider conflicts with OTHER routines. 
            // For self-conflict (within same routine), we handle that by removing the old class instance first or checking separately.
            if (r.id === ignoreRoutineId) continue;

            const d = r.days.find(x => x.name === day);
            if (!d) continue;

            for (const c of d.classes) {
                if (isOverlapping(c.startTime, c.endTime, start, end)) {
                    if (c.teacher === teacher) return true;
                    if (c.room === room) return true;
                }
            }
        }
        return false;
    };

    // 1. REDUCE PHASE
    if (config.reduceLab && config.targetDept) {
        refactoredRoutines.forEach(routine => {
            if (routine.department === config.targetDept) {
                routine.days.forEach(day => {
                    day.classes.forEach(cls => {
                        if (cls.type === 'Lab') {
                            const slots = getSlots(routine.shift);
                            const startIdx = slots.findIndex(s => s.start === cls.startTime);
                            const endIdx = slots.findIndex(s => s.end === cls.endTime);

                            if (startIdx !== -1 && endIdx !== -1) {
                                const duration = endIdx - startIdx + 1;
                                if (duration === 3) {
                                    const newEndSlot = slots[startIdx + 1];
                                    if (newEndSlot) {
                                        cls.endTime = newEndSlot.end;
                                        totalChanges++;
                                    }
                                }
                            }
                        }
                    });
                });
            }
        });
    }

    // 2. UNPLACED RESOLUTION PHASE & RE-SHUFFLE
    refactoredRoutines.forEach(routine => {
        const slots = getSlots(routine.shift);

        routine.days.forEach(day => {
            // We iterate a COPY of classes so we can modify the day.classes array safely
            [...day.classes].forEach(cls => {
                if (cls.room === "Unplaced") {

                    // ATTEMPT 1: Keep Time, Find Room
                    if (config.rooms) {
                        const availableRooms = config.rooms.filter(r =>
                            (cls.type === 'Lab' ? r.isLab : !r.isLab)
                        );

                        for (const room of availableRooms) {
                            const roomName = room.name || room.number;
                            if (!isSlotBusy(null, roomName, day.name, cls.startTime, cls.endTime, routine.id)) {
                                // Double check internal routine conflict? 
                                // (Assume "Unplaced" means no room, but Time is booked, so no internal time conflict)

                                cls.room = roomName;
                                totalChanges++;
                                return;
                            }
                        }
                    }

                    // ATTEMPT 2: Move to Empty Slot (Day/Time change)
                    if (cls.room === "Unplaced") {
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
                        // Try to find ANY slot
                        outerLoop:
                        for (const dName of days) {

                            // Check Load constraint
                            const targetDay = routine.days.find(x => x.name === dName);
                            // Simple constraint: Don't exceed 2 theories or 1 lab? 
                            // Refactor should be aggressive. Valid slot is prioritized.
                            // But avoid strict duplicate subjects per day unless allowed?
                            // Let's assume loose constraints for Refactor to ensure placement.

                            for (let s = 0; s < slots.length; s++) {
                                const duration = (cls.type === 'Lab') ? 2 : 1;
                                const currentStartIdx = slots.findIndex(sl => sl.start === cls.startTime);
                                const currentEndIdx = slots.findIndex(sl => sl.end === cls.endTime);
                                let needed = 1;
                                if (currentStartIdx !== -1 && currentEndIdx !== -1) needed = currentEndIdx - currentStartIdx + 1;
                                else needed = duration; // Default to reduced lab or standard theory

                                if (s + needed > slots.length) continue;

                                const tryStart = slots[s].start;
                                const tryEnd = slots[s + needed - 1].end;

                                // Check Teacher & Room availability
                                if (config.rooms) {
                                    const availableRooms = config.rooms.filter(r =>
                                        (cls.type === 'Lab' ? r.isLab : !r.isLab)
                                    );

                                    for (const room of availableRooms) {
                                        const roomName = room.name || room.number;

                                        // 1. External Busy
                                        if (isSlotBusy(cls.teacher, roomName, dName, tryStart, tryEnd, routine.id)) continue;

                                        // 2. Internal Busy (Check targetDay for OTHER classes)
                                        let internalConflict = false;
                                        if (targetDay) {
                                            for (const existing of targetDay.classes) {
                                                if (existing.id === cls.id) continue; // Skip self if on same day
                                                if (isOverlapping(existing.startTime, existing.endTime, tryStart, tryEnd)) {
                                                    internalConflict = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (internalConflict) continue;

                                        // Found a spot!
                                        // Remove from old day
                                        day.classes = day.classes.filter(x => x.id !== cls.id);

                                        // Add to new day
                                        const newCls = { ...cls, startTime: tryStart, endTime: tryEnd, room: roomName };

                                        if (!targetDay) { // Should not happen if we init days
                                            // Handle case
                                        } else {
                                            targetDay.classes.push(newCls);
                                            targetDay.classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
                                        }

                                        totalChanges++;
                                        break outerLoop; // Move to next unplaced item
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });
    });

    return {
        routines: refactoredRoutines,
        changes: totalChanges,
        message: `Refactor complete. ${totalChanges} adjustments made.`
    };
};
