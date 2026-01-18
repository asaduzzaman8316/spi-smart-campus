// Helper: Enforce Contiguity
const checkContiguity = (daysState, slots, dayName, startIdx, duration) => {
    const day = daysState.find(d => d.name === dayName);
    if (!day || !day.classes || day.classes.length === 0) return true;

    const endIdx = startIdx + duration - 1;
    const currentIndices = new Set();
    day.classes.forEach(c => {
        const cs = slots.findIndex(s => s.start === c.startTime);
        const ce = slots.findIndex(s => s.end === c.endTime);
        if (cs !== -1 && ce !== -1) {
            for (let i = cs; i <= ce; i++) currentIndices.add(i);
        }
    });

    if (currentIndices.size === 0) return true;

    // Proposed new state: current + new
    const combinedIndices = new Set(currentIndices);
    for (let i = startIdx; i <= endIdx; i++) {
        combinedIndices.add(i);
    }

    const sorted = Array.from(combinedIndices).sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // If (max - min + 1) matches the number of unique indices, it's one contiguous block
    return (max - min + 1) === sorted.length;
};

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
    const warnings = []; // Track warnings like compression (3 -> 2 periods)

    const shuffleArray = (arr) => {
        const array = [...arr];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

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

    const isTeacherBusy = (teacherName, dayName, start, end, subjectToMerge = null, typeToMerge = null, ignoreIds = []) => {
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
                if (ignoreIds.includes(cls.id)) continue;
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
            if (ignoreIds.includes(cls.id)) continue;
            if (cls.teacher === teacherName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                return true;
            }
        }

        return false;
    };

    const isRoomBusy = (roomName, dayName, start, end, ignoreIds = []) => {
        // 1. Check Other Routines
        for (const r of allRoutines) {
            if (r.id === currentRoutineConfig.id) continue;
            const dayData = r.days.find(d => d.name === dayName);
            if (dayData) {
                for (const cls of dayData.classes) {
                    if (ignoreIds.includes(cls.id)) continue;
                    if (cls.room === roomName && isOverlapping(cls.startTime, cls.endTime, start, end)) {
                        return true;
                    }
                }
            }
        }
        // 2. Check Current Generated Local State
        const currentDay = generatedDays.find(d => d.name === dayName);
        for (const cls of currentDay.classes) {
            if (ignoreIds.includes(cls.id)) continue;
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
                score += 500; // MUCH HIGHER priority: Room matches Subject (e.g. Java -> Computer Lab)
            } else if (routineMatch) {
                score += 100; // Backup: Room matches Class Department
            } else if (rDept && sDept) {
                // If departments are specified but don't match, give a penalty
                score -= 100;
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
    // Randomize Theory and Lab items to ensure non-serial assignment
    const labs = shuffleArray(toPlace.filter(x => x.type === 'Lab'));
    const theories = shuffleArray(toPlace.filter(x => x.type === 'Theory'));

    // Track items that couldn't be placed
    const unplacedItems = [];

    labs.forEach(lab => {
        let placed = false;
        let slotsNeeded = lab.duration;

        // --- ROUND 1: Try finding a slot that respects "One Lab Per Day" ---
        const sortedDays = shuffleArray([...days]).sort((a, b) => {
            const dayA = generatedDays.find(d => d.name === a);
            const dayB = generatedDays.find(d => d.name === b);
            const hasLabA = dayA.classes.some(c => c.type === 'Lab');
            const hasLabB = dayB.classes.some(c => c.type === 'Lab');
            if (hasLabA === hasLabB) return 0;
            return hasLabA ? 1 : -1; // No Lab comes first
        });

        const tryPlaceLab = (dayName, duration) => {
            const dayObj = generatedDays.find(d => d.name === dayName);
            if (isConstraintViolated(dayName, lab.subject, lab.totalLoad)) return false;

            // Shift-specific logic: Randomize slot order too
            const slotIndices = Array.from({ length: slots.length - duration + 1 }, (_, i) => i);
            const shuffledSlotIndices = shuffleArray(slotIndices);

            for (const s of shuffledSlotIndices) {
                const startSlot = slots[s];
                const endSlot = slots[s + duration - 1];

                if (isGroupBusy(dayName, startSlot.start, endSlot.end)) continue;

                if (!checkContiguity(generatedDays, slots, dayName, s, duration)) continue;

                let teacherConflict = false;
                for (let k = 0; k < duration; k++) {
                    if (isTeacherBusy(lab.teacher, dayName, slots[s + k].start, slots[s + k].end, lab.subject, lab.type)) {
                        teacherConflict = true;
                        break;
                    }
                }
                if (teacherConflict) continue;

                if (isLinkedRoutineBusy(dayName, startSlot.start, endSlot.end)) continue;

                // Room Check
                const subjectObj = subjects.find(s => s.name === lab.subject);
                const subjectDept = subjectObj ? subjectObj.department : null;
                const mergeRoom = findMergeRoom(lab.teacher, lab.subject, lab.type, dayName, startSlot.start, endSlot.end);

                let chosenRoom = mergeRoom;
                let isMerged = !!mergeRoom;

                if (!chosenRoom) {
                    let bestRoom = null;
                    let bestScore = -10000;
                    const availableRooms = rooms.filter(r => r.isLab);
                    for (const room of availableRooms) {
                        let roomConflict = false;
                        for (let k = 0; k < duration; k++) {
                            if (isRoomBusy(room.name || room.number, dayName, slots[s + k].start, slots[s + k].end)) {
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
                    if (bestRoom) chosenRoom = bestRoom.name || bestRoom.number;
                }

                if (chosenRoom) {
                    addClass(dayName, { start: startSlot.start, end: endSlot.end }, { ...lab, duration }, chosenRoom, isMerged);
                    return true;
                }
            }
            return false;
        };

        // Try Round 1 (1 Lab per day)
        for (const d of sortedDays) {
            const dayObj = generatedDays.find(x => x.name === d);
            if (dayObj.classes.some(c => c.type === 'Lab')) continue;
            if (tryPlaceLab(d, slotsNeeded)) {
                placed = true;
                break;
            }
        }

        // --- ROUND 2: Try ANY day (Allow 2 Labs per day) ---
        if (!placed) {
            for (const d of shuffleArray([...days])) {
                if (tryPlaceLab(d, slotsNeeded)) {
                    placed = true;
                    break;
                }
            }
        }

        // --- ROUND 3: Make Space (Move Theory classes) to keep 3 periods ---
        if (!placed && slotsNeeded === 3) {
            for (const dName of shuffleArray([...days])) {
                const dayObj = generatedDays.find(d => d.name === dName);
                if (dayObj.classes.some(c => c.type === 'Lab') && labs.length <= 5) continue;

                for (let s = 0; s <= slots.length - slotsNeeded; s++) {
                    const blockSlots = slots.slice(s, s + slotsNeeded);
                    const classesToMove = dayObj.classes.filter(c =>
                        c.type === 'Theory' &&
                        blockSlots.some(bs => isOverlapping(c.startTime, c.endTime, bs.start, bs.end))
                    );
                    const nonTheoryBlockers = dayObj.classes.filter(c =>
                        c.type !== 'Theory' &&
                        blockSlots.some(bs => isOverlapping(c.startTime, c.endTime, bs.start, bs.end))
                    );

                    if (nonTheoryBlockers.length === 0 && classesToMove.length > 0) {
                        let teacherConflict = false;
                        for (const bs of blockSlots) {
                            if (isTeacherBusy(lab.teacher, dName, bs.start, bs.end, lab.subject, lab.type)) {
                                teacherConflict = true;
                                break;
                            }
                        }
                        if (teacherConflict) continue;

                        let bestRoom = null;
                        let bestScore = -1000;
                        const availableRooms = rooms.filter(r => r.isLab);
                        for (const room of availableRooms) {
                            let roomConflict = false;
                            for (const bs of blockSlots) {
                                if (isRoomBusy(room.name || room.number, dName, bs.start, bs.end)) {
                                    roomConflict = true;
                                    break;
                                }
                            }
                            if (!roomConflict) {
                                const subjectObj = subjects.find(sj => sj.name === lab.subject);
                                const sDept = subjectObj ? subjectObj.department : null;
                                const score = getRoomScore(room, currentRoutineConfig.department, true, null, sDept);
                                if (score > bestScore) {
                                    bestScore = score;
                                    bestRoom = room;
                                }
                            }
                        }

                        if (bestRoom) {
                            dayObj.classes = dayObj.classes.filter(c => !classesToMove.includes(c));
                            classesToMove.forEach(c => theories.push({ ...c, theoryCount: 1, labCount: 0, type: 'Theory', duration: 1 }));
                            addClass(dName, { start: blockSlots[0].start, end: blockSlots[blockSlots.length - 1].end }, lab, bestRoom.name || bestRoom.number);
                            placed = true;
                            break;
                        }
                    }
                }
                if (placed) break;
            }
        }



        if (!placed) unplacedItems.push({ ...lab, reason: 'No Lab Slot/Teacher Busy' });
    });

    const theoriesToPlace = [...theories];
    let thIdx = 0;
    while (thIdx < theoriesToPlace.length) {
        const theory = theoriesToPlace[thIdx];
        let placed = false;

        const tryPlaceTheory = (dayName, mustBeAdjacent = false) => {
            if (isConstraintViolated(dayName, theory.subject, theory.totalLoad)) return false;
            const dayObj = generatedDays.find(d => d.name === dayName);

            const shuffledSlots = shuffleArray(slots);

            for (const slot of shuffledSlots) {
                const sIdx = slots.findIndex(s => s.start === slot.start);

                if (!checkContiguity(generatedDays, slots, dayName, sIdx, 1)) continue;

                if (isGroupBusy(dayName, slot.start, slot.end)) continue;
                if (isTeacherBusy(theory.teacher, dayName, slot.start, slot.end, theory.subject)) continue;
                if (isLinkedRoutineBusy(dayName, slot.start, slot.end)) continue;

                const subjectObj = subjects.find(s => s.name === theory.subject);
                const subjectDept = subjectObj ? subjectObj.department : null;
                const mergeRoom = findMergeRoom(theory.teacher, theory.subject, theory.type, dayName, slot.start, slot.end);

                let chosenRoom = mergeRoom;
                if (!chosenRoom) {
                    let bestRoom = null;
                    let bestScore = -10000;
                    const availableRooms = rooms.filter(r => !r.isLab);
                    for (const room of availableRooms) {
                        if (isRoomBusy(room.name || room.number, dayName, slot.start, slot.end)) continue;
                        const score = getRoomScore(room, currentRoutineConfig.department, false, null, subjectDept);
                        if (score > bestScore) {
                            bestScore = score;
                            bestRoom = room;
                        }
                    }
                    if (bestRoom) chosenRoom = bestRoom.name || bestRoom.number;
                }

                if (chosenRoom) {
                    addClass(dayName, slot, theory, chosenRoom, !!mergeRoom);
                    return true;
                }
            }
            return false;
        };

        const populatedDays = shuffleArray(days.filter(d => generatedDays.find(gd => gd.name === d).classes.length > 0));
        for (const d of populatedDays) {
            if (tryPlaceTheory(d, true)) { placed = true; break; }
        }

        if (!placed) {
            const emptyDays = shuffleArray(days.filter(d => generatedDays.find(gd => gd.name === d).classes.length === 0));
            for (const d of emptyDays) {
                if (tryPlaceTheory(d, false)) { placed = true; break; }
            }
        }

        if (!placed) {
            for (const d of shuffleArray(days)) {
                if (tryPlaceTheory(d, false)) { placed = true; break; }
            }
        }

        if (!placed) unplacedItems.push({ ...theory, reason: 'No Theory Slot/Teacher Busy' });
        thIdx++;
    }

    // --- COMPACTION: BIDIRECTIONAL SLIDE (No Middle Gaps) ---
    // User Requirement: Gaps allowed only at START or END. No gaps between classes.
    days.forEach(dayName => {
        const day = generatedDays.find(d => d.name === dayName);
        if (day.classes.length <= 1) return;

        let improved = true;
        let iterations = 0;

        while (improved && iterations < 10) { // Limit iterations to prevent infinite loops
            improved = false;
            iterations++;

            // Sort by start time to ensures we process gaps in order
            day.classes.sort((a, b) => a.startTime.localeCompare(b.startTime));

            for (let i = 0; i < day.classes.length - 1; i++) {
                const prev = day.classes[i];
                const curr = day.classes[i + 1];

                const prevEndIdx = slots.findIndex(s => s.end === prev.endTime);
                const currStartIdx = slots.findIndex(s => s.start === curr.startTime);

                // Check for Gap
                if (currStartIdx > prevEndIdx + 1) {

                    // STRATEGY 1: SLIDE UP (Left) - Move 'curr' backwards to touch 'prev'
                    // Target for 'curr': Start at prevEndIdx + 1
                    const currDuration = slots.findIndex(s => s.end === curr.endTime) - currStartIdx + 1;
                    const newCurrStartIdx = prevEndIdx + 1;
                    const newCurrEndIdx = newCurrStartIdx + currDuration - 1;

                    if (newCurrEndIdx < slots.length) {
                        const ns = slots[newCurrStartIdx].start;
                        const ne = slots[newCurrEndIdx].end;

                        // Check Conflicts for 'curr' at new time
                        let busy = false;
                        if (isTeacherBusy(curr.teacher, dayName, ns, ne, null, null, [curr.id])) busy = true;
                        else if (isRoomBusy(curr.room, dayName, ns, ne, [curr.id])) busy = true;
                        else if (isLinkedRoutineBusy(dayName, ns, ne)) busy = true;

                        if (!busy) {
                            curr.startTime = ns;
                            curr.endTime = ne;
                            improved = true;
                            // We made a move, sort and restart to ensure consistency
                            break;
                        }
                    }

                    // STRATEGY 2: SLIDE DOWN (Right) - Move 'prev' forwards to touch 'curr'
                    // Only try this if we can't move left.
                    // This pushes 'prev' to end at currStartIdx - 1
                    const prevDuration = prevEndIdx - slots.findIndex(s => s.start === prev.startTime) + 1;
                    const newPrevEndIdx = currStartIdx - 1;
                    const newPrevStartIdx = newPrevEndIdx - prevDuration + 1;

                    if (newPrevStartIdx >= 0) {
                        const ns = slots[newPrevStartIdx].start;
                        const ne = slots[newPrevEndIdx].end;

                        // Check Conflicts for 'prev' at new time
                        let busy = false;
                        if (isTeacherBusy(prev.teacher, dayName, ns, ne, null, null, [prev.id])) busy = true;
                        else if (isRoomBusy(prev.room, dayName, ns, ne, [prev.id])) busy = true;
                        else if (isLinkedRoutineBusy(dayName, ns, ne)) busy = true;

                        if (!busy) {
                            prev.startTime = ns;
                            prev.endTime = ne;
                            improved = true;
                            break; // Restart loop
                        }
                    }

                    // STRATEGY 3: FILL FROM FUTURE (Reorder)
                    // If we can't slide, try to find a later class that fits in the gap.
                    const gapSize = currStartIdx - (prevEndIdx + 1); // logic in slot counts

                    // We need a class that fits in 'gapSize' slots
                    // Start checking from i + 2 (class after 'curr')
                    for (let k = i + 2; k < day.classes.length; k++) {
                        const futureClass = day.classes[k];
                        const fDuration = slots.findIndex(s => s.end === futureClass.endTime) - slots.findIndex(s => s.start === futureClass.startTime) + 1;

                        if (fDuration <= gapSize) {
                            // Try to move futureClass to prevEndIdx + 1
                            const targetStartIdx = prevEndIdx + 1;
                            const targetEndIdx = targetStartIdx + fDuration - 1;

                            const ns = slots[targetStartIdx].start;
                            const ne = slots[targetEndIdx].end;

                            // Check conflicts for futureClass at this new time
                            let fBusy = false;
                            if (isTeacherBusy(futureClass.teacher, dayName, ns, ne, null, null, [futureClass.id])) fBusy = true;
                            else if (isRoomBusy(futureClass.room, dayName, ns, ne, [futureClass.id])) fBusy = true;
                            else if (isLinkedRoutineBusy(dayName, ns, ne)) fBusy = true;

                            if (!fBusy) {
                                // Move it!
                                futureClass.startTime = ns;
                                futureClass.endTime = ne;
                                improved = true;
                                // Break inner loop and restart main loop (resort will handle order)
                                break;
                            }
                        }
                    }
                    if (improved) break; // Break from the 'i' loop to resort
                }
            }
        }
    });

    const failuresWithSuggestions = unplacedItems.map(item => {
        const suggestions = [];
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

        if (item.type === 'Lab') {
            const slotsNeeded = item.duration || (item.labCount === 2 ? 2 : 3);
            days.forEach(dayName => {
                if (isConstraintViolated(dayName, item.subject, item.totalLoad)) return;
                const day = generatedDays.find(d => d.name === dayName);
                if (!day) return;
                for (let s = 0; s <= slots.length - slotsNeeded; s++) {
                    const ss = slots[s];
                    const es = slots[s + slotsNeeded - 1];
                    if (isGroupBusy(dayName, ss.start, es.end)) continue;
                    let teacherBusy = false;
                    for (let k = 0; k < slotsNeeded; k++) {
                        if (isTeacherBusy(item.teacher, dayName, slots[s + k].start, slots[s + k].end, item.subject, item.type)) {
                            teacherBusy = true;
                            break;
                        }
                    }
                    if (teacherBusy) continue;
                    if (isLinkedRoutineBusy(dayName, ss.start, es.end)) continue;
                    let bestRoom = null;
                    let bestScore = -10000;
                    const availableRooms = rooms.filter(r => r.isLab);
                    for (const room of availableRooms) {
                        let roomBusy = false;
                        for (let k = 0; k < slotsNeeded; k++) {
                            if (isRoomBusy(room.name || room.number, dayName, slots[s + k].start, slots[s + k].end)) {
                                roomBusy = true;
                                break;
                            }
                        }
                        if (!roomBusy) {
                            const subObj = subjects.find(sj => sj.name === item.subject);
                            const sd = subObj ? subObj.department : null;
                            const score = getRoomScore(room, currentRoutineConfig.department, true, null, sd);
                            if (score > bestScore) {
                                bestScore = score;
                                bestRoom = room;
                            }
                        }
                    }
                    if (bestRoom) {
                        suggestions.push({
                            routine: "Available Slot",
                            day: dayName,
                            time: `${ss.start}-${es.end}`,
                            room: bestRoom.name || bestRoom.number,
                            type: 'New Slot'
                        });
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

    return { generatedDays, unplacedItems: failuresWithSuggestions, warnings };
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
    let allWarnings = [];

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
                labCount: sub.lab,
                duration: sub.duration
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
                const { generatedDays, unplacedItems, warnings } = generateRoutine(
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

                if (warnings && warnings.length > 0) {
                    allWarnings.push({
                        routine: `${primaryRoutine.department} - ${primaryRoutine.semester} (${primaryRoutine.group})`,
                        items: warnings
                    });
                }
            }
        }
    }

    return { routines: workingRoutines, failures: allFailures, warnings: allWarnings };
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
                
                // --- MODIFICATION: ENFORCE CONTIGUITY ---
                if (!checkContiguity(routine.days, slots, dName, s, needed)) continue;

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


// --- REGENERATE ALL (Refactor By Reset) ---
export const regenerateAllRoutines = (allRoutines, rooms, subjects) => {
    // 1. Group Routines by Logical Target (Dept/Sem/Shift/Group)
    const logicalRoutinesMap = new Map(); // Key: "Dept|Sem|Shift|Group", Value: { canonicalId, canonicalRoutine, classes: [] }

    const getTechId = (r) => `${r.department}|${r.semester}|${r.shift}|${r.group}`;

    allRoutines.forEach(r => {
        const key = getTechId(r);
        if (!logicalRoutinesMap.has(key)) {
            logicalRoutinesMap.set(key, {
                canonicalId: r.id || r._id,
                canonicalRoutine: r,
                classes: []
            });
        }
        const entry = logicalRoutinesMap.get(key);
        r.days.forEach(d => {
            d.classes.forEach(c => {
                 entry.classes.push({ ...c, day: d.name });
            });
        });
    });

    // 2. Extract Assignments (Reconstruct Load & Merges)
    // Structure: Map<TeacherName, Map<SubjectName, Array<ClassInstance>>>
    const teacherLoadMap = new Map();

    logicalRoutinesMap.forEach((entry, techId) => {
        const { classes, canonicalId } = entry;
        
        classes.forEach(c => {
            if (!c.subject || !c.teacher) return;

            const getMin = (t) => {
                const [h, m] = t.split(':').map(Number);
                return h * 60 + m;
            };
            const durationMin = getMin(c.endTime) - getMin(c.startTime);
            // Round to nearest period (assuming 45 min blocks, but safeguarding small misalignments)
            const durationPeriods = Math.max(1, Math.round(durationMin / 40)); 

            if (!teacherLoadMap.has(c.teacher)) teacherLoadMap.set(c.teacher, new Map());
            const subjMap = teacherLoadMap.get(c.teacher);

            if (!subjMap.has(c.subject)) subjMap.set(c.subject, []);
            const instances = subjMap.get(c.subject);

            instances.push({
                routineId: canonicalId,
                techId: techId,
                day: c.day,
                startTime: c.startTime,
                endTime: c.endTime,
                type: c.type,
                duration: durationPeriods
            });
        });
    });

    const assignments = []; 

    teacherLoadMap.forEach((subjMap, teacherName) => {
        const assignment = {
            id: Date.now() + Math.random(),
            teacherId: `REF_${teacherName}`,
            teacherName: teacherName,
            subjects: [],
            blockedTimes: []
        };

        subjMap.forEach((instances, subjectName) => {
            let theoryCount = 0;
            let labCount = 0;
            const techSet = new Set();
            const mergedGroups = {};

            // Group instances by TIME to detect Merges
            const timeGroups = new Map(); // Key: "Day|Start", Value: [instances]

            instances.forEach(inst => {
                const timeKey = `${inst.day}|${inst.startTime}`;
                if (!timeGroups.has(timeKey)) timeGroups.set(timeKey, []);
                timeGroups.get(timeKey).push(inst);
            });

            // Analyze Time Groups
            timeGroups.forEach((groupInstances) => {
                const first = groupInstances[0];
                const isLab = first.type === 'Lab' || first.type === 'Practical';
                
                // Determine duration of this block (Max of instances involved)
                const duration = Math.max(...groupInstances.map(i => i.duration));

                if (isLab) {
                    labCount += duration; // Add actual periods (e.g. +3)
                } else {
                    theoryCount += duration; // Add actual periods (usually +1)
                }

                // Identify Technologies involved (Merges)
                const distinctTechs = new Set(groupInstances.map(g => g.techId));
                distinctTechs.forEach(t => techSet.add(t));
                const involvedTechs = Array.from(distinctTechs);

                if (involvedTechs.length > 1) {
                    involvedTechs.forEach(source => {
                        if (!mergedGroups[source]) mergedGroups[source] = [];
                        involvedTechs.forEach(target => {
                            if (source !== target && !mergedGroups[source].includes(target)) {
                                mergedGroups[source].push(target);
                            }
                        });
                    });
                }
            });

            assignment.subjects.push({
                id: Date.now() + Math.random(),
                subject: subjectName,
                theory: theoryCount,
                lab: labCount,
                technologies: Array.from(techSet),
                mergedGroups: mergedGroups
            });
        });

        if (assignment.subjects.length > 0) {
            assignments.push(assignment);
        }
    });

    // 3. Prepare Fresh Routines (Unique class containers with ID preserved)
    const freshRoutines = Array.from(logicalRoutinesMap.values()).map(entry => ({
        ...entry.canonicalRoutine,
         days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map(d => ({ name: d, classes: [] })),
         id: entry.canonicalId
    }));

    // 4. Call Batch Generator
    return generateBatchRoutines(assignments, freshRoutines, rooms, subjects);
};
