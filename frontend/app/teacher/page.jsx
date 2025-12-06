import TeacherList from "./TeacherClient";

export const metadata = {
    title: "Teacher Directory - SPI Smart Campus",
    description: "Find contact information and profiles of all faculty members at Sylhet Polytechnic Institute (SPI). Filter teachers by department.",
    openGraph: {
        title: "SPI Teacher Directory - Sylhet Polytechnic Institute",
        description: "Browse the complete list of SPI faculty members and their contact details.",
        images: ['/sy.png'],
    },
};

export default function TeacherPage() {
    return <TeacherList />;
}
