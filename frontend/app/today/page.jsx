import TodayRoutine from "./TodayClient";

export const metadata = {
    title: "Today's Class Schedule - SPI Smart Campus",
    description: "Check your daily class routine for today instantly. Live schedule updates for all departments of Sylhet Polytechnic Institute.",
    openGraph: {
        title: "Today's Class Schedule - SPI Smart Campus",
        description: "Don't miss a class! View today's live schedule for your department and group.",
        images: ['/sy.png'],
    },
    keywords: ["Today's Routine", "SPI Class Schedule", "Daily Routine", "Sylhet Polytechnic Live Routine", "Class Timestamp"],
};

export default function TodayPage() {
    return <TodayRoutine />;
}
