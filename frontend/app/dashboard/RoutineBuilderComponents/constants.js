export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7];
export const SHIFTS = ["1st", "2nd"];
export const GROUPS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const INITIAL_ROUTINE = {
    id: '',
    department: '',
    semester: '',
    shift: '',
    group: '',
    lastUpdated: 0,
    days: DAYS.map(day => ({ name: day, classes: [] }))
};
