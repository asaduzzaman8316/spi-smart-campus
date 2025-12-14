export const generateRoutine = (
    currentRoutineConfig, // { department, semester, shift, group }
    loadItems,            // [{ subject, teacher, theoryCount, labCount }]
    constraints,          // [{ teacher, day, startTime, endTime }] (Manual blocks)
    allRoutines,          // All existing routines from DB
    rooms,                // List of room objects
    teachers,             // List of teacher objects
    subjects              // List of subject objects
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

    const isTeacherBusy = (teacherName, dayName, start, end, ignoreMerge = false, subjectToMerge = null) => {
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
                    // MERGE LOGIC: If same subject, it's NOT busy, it's a merge opportunity!
                    if (ignoreMerge && cls.subject === subjectToMerge) {
                        return false; // Not busy, compatible!
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

    // --- PHASE 1: Identify Merging Opportunities ---
    // DISABLED: User requested UNIQ ROOMS for every class during auto-generation.
    // "not combine the class in autocreate routine time"

    // 4. Check Advanced Constraint: Separation of Theory/Lab for same Subject
    // 4. Check Advanced Constraint: Separation of Theory/Lab for same Subject
    const isConstraintViolated = (dayName, subjectName) => {
        // Rule: A subject can appear ONLY ONCE per day.
        // If ANY class with this subject exists, it is a violation.

        const day = generatedDays.find(d => d.name === dayName);
        if (!day) return false;

        // Check local generated classes
        return day.classes.some(c => c.subject === subjectName);
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
    const getRoomScore = (room, department, isLab, previousClassRoom) => {
        let score = 0;
        const location = room.location || ""; // e.g. "Computer Building", "Administration Building"

        // Define Target Buildings based on Department
        // Computer & Electromedical -> "Computer Building"
        // Others -> "Administration Building"
        const isTechDept = ["Computer", "Electromedical"].some(d => department.includes(d));
        const targetBuilding = isTechDept ? "Computer Building" : "Administration Building";

        // 1. Building Preference
        if (location === targetBuilding) {
            score += 10;
        } else {
            // Strong penalty for Labs in wrong building
            if (isLab) score -= 50;
            // Moderate penalty for Theory in wrong building
            else score -= 5;
        }

        // 2. Proximity / Continuity (Minimize Walking)
        if (previousClassRoom && previousClassRoom.location === location) {
            score += 5;
        }

        // 3. Department Preference (Secondary)
        if (room.department === department) {
            score += 2;
        }

        return score;
    };




    // 2. Process Labs (Prioritize 3 periods, fallback to 2 periods)

    // Queue of items to place
    // Expand loadItems into discrete units
    let toPlace = [];
    loadItems.forEach(item => {
        for (let i = 0; i < item.theoryCount; i++) toPlace.push({ ...item, type: 'Theory' });
        for (let i = 0; i < item.labCount; i++) toPlace.push({ ...item, type: 'Lab' });
    });

    const labs = toPlace.filter(x => x.type === 'Lab');
    const theories = toPlace.filter(x => x.type === 'Theory');

    // Track items that couldn't be placed
    const unplacedItems = [];

    labs.forEach(lab => {
        let placed = false;

        // Strategy: Try 3 slots first, then 2 slots
        const durationsToTry = [3, 2];

        for (const slotsNeeded of durationsToTry) {
            if (placed) break;

            // Search all days
            for (const day of days) {
                if (placed) break;

                // CONSTRAINT CHECK: Separate Theory & Lab (Now strict Frequency Check)
                if (isConstraintViolated(day, lab.subject)) continue;

                for (let s = 0; s <= slots.length - slotsNeeded; s++) {
                    const startSlot = slots[s];
                    const endSlot = slots[s + slotsNeeded - 1]; // Inclusive

                    // Check Teacher Availability for WHOLE block
                    // Optimization: Check if teacher is busy for ANY of the slots in the range
                    let teacherConflict = false;
                    for (let check = 0; check < slotsNeeded; check++) {
                        const checkSlot = slots[s + check];
                        // Pass ignoreMerge=false because we strictly need empty space for a NEW Lab
                        if (isTeacherBusy(lab.teacher, day, checkSlot.start, checkSlot.end)) {
                            teacherConflict = true;
                            break;
                        }
                    }
                    if (teacherConflict) continue;

                    // Check Room Availability
                    // Find a valid Lab Room using Scoring
                    const validRooms = rooms.filter(r =>
                        r.type === 'Lab' &&
                        !isRoomBusy(r.number || r.name, day, startSlot.start, endSlot.end)
                    );

                    // Sort valid rooms by score
                    validRooms.sort((a, b) => {
                        const scoreA = getRoomScore(a, currentRoutineConfig.department, true, null);
                        const scoreB = getRoomScore(b, currentRoutineConfig.department, true, null);
                        return scoreB - scoreA; // Descending
                    });

                    // Pick best room (first one)
                    const validRoom = validRooms[0];

                    if (validRoom) {
                        addClass(day, { start: startSlot.start, end: endSlot.end }, lab, validRoom.number || validRoom.name);
                        placed = true;
                        break;
                    }
                }
            }
        }
        if (!placed) unplacedItems.push(lab);
    });

    // 3. Process Remaining Theory
    theories.forEach(theory => {
        let placed = false;

        // Count classes per day to ensure distribution
        // Sort days by "least classes first" to spread load
        const daysSorted = [...days].sort((a, b) => {
            const lenA = generatedDays.find(d => d.name === a).classes.length;
            const lenB = generatedDays.find(d => d.name === b).classes.length;
            return lenA - lenB;
        });

        for (const day of daysSorted) {
            if (placed) break;

            // CONSTRAINT CHECK: Separate Theory & Lab
            if (isConstraintViolated(day, theory.subject)) continue;

            for (const slot of slots) {
                // Check if slot overlaps with any class already in this day
                const dData = generatedDays.find(d => d.name === day);
                const isSlotTaken = dData.classes.some(c => isOverlapping(c.startTime, c.endTime, slot.start, slot.end));

                if (isSlotTaken) continue;

                if (isTeacherBusy(theory.teacher, day, slot.start, slot.end)) continue;

                // Find Room
                // Prefer same building if previous class exists? (Complexity++]
                // Simple: Find FIRST free Theory room
                // Find Valid Room with Scoring
                const validRooms = rooms.filter(r =>
                    r.type !== 'Lab' &&
                    !isRoomBusy(r.number || r.name, day, slot.start, slot.end)
                );

                // Find previous class room for continuity
                // Simple logic: check the LAST added class in this day
                // (Note: `generatedDays` is being modified, so we can check it)
                const currentDayObj = generatedDays.find(d => d.name === day);
                const lastClass = currentDayObj.classes[currentDayObj.classes.length - 1];
                let previousRoomObj = null;
                if (lastClass) {
                    previousRoomObj = rooms.find(r => (r.number || r.name) === lastClass.room);
                }

                validRooms.sort((a, b) => {
                    const scoreA = getRoomScore(a, currentRoutineConfig.department, false, previousRoomObj);
                    const scoreB = getRoomScore(b, currentRoutineConfig.department, false, previousRoomObj);
                    return scoreB - scoreA;
                });

                const chosenRoom = validRooms[0]; // Best room

                if (chosenRoom) {
                    addClass(day, slot, theory, chosenRoom.number || chosenRoom.name);
                    placed = true;
                    break;
                }
            }
        }
        if (!placed) unplacedItems.push(theory);
    });

    // --- Generate Merge Suggestions for Unplaced Items ---
    const failuresWithSuggestions = unplacedItems.map(item => {
        // Look for ANY existing class with same teacher + subject in OTHER routines
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
                            room: c.room
                        });
                    }
                });
            });
        });

        return {
            ...item,
            reason: "No Room/Time Available",
            suggestions: suggestions
        };
    });

    return { generatedDays, unplacedItems: failuresWithSuggestions };
};


// --- BATCH GENERATOR ---
export const generateBatchRoutines = (
    assignments, // [{ teacherId, teacherName, subjects: [{ subject, technologies: ['Dept|Sem|Shift|Grp'], theory, lab }] }]
    allExistingRoutines, // Array of all routines in DB
    rooms,
    subjects
) => {
    // 1. Create a working copy of all routines so we can update them as we go
    // (We need to track allocations across the batch)
    let workingRoutines = JSON.parse(JSON.stringify(allExistingRoutines));
    let allFailures = [];

    // We also might need to CREATE new routines if they don't exist yet
    // Helper to find or create
    const getRoutine = (techId) => {
        const [dept, sem, shift, grp] = techId.split('|');
        let routine = workingRoutines.find(r =>
            r.department === dept &&
            r.semester == sem &&
            r.shift === shift &&
            r.group === grp
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
            // Build the load item for this specific subject
            const loadItem = {
                subject: sub.subject,
                teacher: assignment.teacherName,
                theoryCount: sub.theory,
                labCount: sub.lab
            };

            // 3. Distribute to Technologies
            for (const techId of sub.technologies) {
                const targetRoutine = getRoutine(techId);

                // 4. Generate/Update Schedule for THIS routine
                // We pass 'workingRoutines' as 'allRoutines', so the generator knows about 
                // what we just did in other routines (Conflict Checks).
                // But specifically for the generator, it needs to treat the 'targetRoutine' as the 'current' one.

                // We only want to add THIS specific load item, not re-generate everything?
                // Or do we?
                // If the routine has existing classes, we want to KEEP them.
                // Our modified `generateRoutine` now checks `currentRoutineConfig.days` and keeps them if present.
                // So we can safely pass [loadItem] as the "new load" to add.

                const { generatedDays, unplacedItems } = generateRoutine(
                    targetRoutine,
                    [loadItem], // Only add this subject's load
                    [], // No manual constraints passed here for now
                    workingRoutines, // CRITICAL: This includes updates from previous loops
                    rooms,
                    [], // Teachers list not strictly needed inside if we pass names? logic uses it? logic uses names.
                    subjects
                );

                // 5. Update the routine with new days
                targetRoutine.days = generatedDays;

                // Collect failures
                if (unplacedItems && unplacedItems.length > 0) {
                    allFailures.push({
                        routine: `${targetRoutine.department} - ${targetRoutine.semester} (${targetRoutine.group})`,
                        items: unplacedItems
                    });
                }

                // WorkingRoutines is now updated implicitly because targetRoutine is a reference to an object inside it?
                // Yes, JS objects are references. 
                // But `generateRoutine` returns a DEEP COPY or NEW array of days. 
                // So we assigned `targetRoutine.days = updatedDays`. 
                // Since `targetRoutine` is an element of `workingRoutines`, the master list IS updated.
                // So the next iteration's `isTeacherBusy` check will see classes added in `updatedDays`
                // because `isTeacherBusy` iterates over `workingRoutines` (passed as allRoutines).
            }
        }
    }

    return { routines: workingRoutines, failures: allFailures };
};
