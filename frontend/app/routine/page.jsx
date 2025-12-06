import RoutineDisplay from "./RoutineClient";

export const metadata = {
  title: "Class Routine - SPI Smart Campus",
  description: "View and download the latest designated class routines for Sylhet Polytechnic Institute (SPI). Filter by department, semester, shift, and group.",
  openGraph: {
    title: "SPI Class Routine - Sylhet Polytechnic Institute",
    description: "Access your daily class schedule instantly. Filter by department and semester.",
    images: ['/sy.png'],
  },
};

export default function RoutinePage() {
  return <RoutineDisplay />;
}
