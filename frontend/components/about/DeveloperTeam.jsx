'use client'
import ProfileCard from './ProfileCard'

const DeveloperTeam = () => {
    const mentors = [
        {
            id: 1,
            name: 'Ruma Akter',
            role: 'Instructor & Head of the Dept.',
            image: 'https://sylhet.polytech.gov.bd/sites/default/files/files/sylhet.polytech.gov.bd/teacher_list/a38f81c0_bfd0_4247_a0f0_75c6b010e3ad/2025-02-04-12-05-294aa908f58539454f9bd3efcdfd47c8.jpg',
            bio: 'Guiding students with expertise in software engineering. Passionate about nurturing innovation and technical excellence.',
            verified: true,
            link: ''
        },
        {
            id: 2,
            name: 'Md Sydur Rahman',
            role: 'Junior Instructor',
            image: '/sydur.jpeg',
            bio: 'Expert in Full-Stack Development and System Architecture. Committed to building scalable solutions.',
            verified: true,
            link: ''
        },
    ]

    const teamLead = {
        id: 3,
        name: 'Md. Asaduzzaman',
        role: 'Team Lead & Full-Stack Developer',
        image: '/asad.png',
        bio: 'Leading the team with a strong vision and building scalable systems with modern technologies.',
        verified: true,
        link: 'https://asaduzzaman-dev.vercel.app/'
    }

    const teamMembers = [
        {
            id: 4,
            name: 'Md. Shahriar Dristy',
            role: 'Frontend Developer',
            image: '/disty.jpg',
            bio: 'UI/UX enthusiast specializing in React & Next.js.',
            verified: true,
            link: ''
        },
        {
            id: 5,
            name: 'Md. Ismail Hossen',
            role: 'Backend Developer',
            image: '/ismail.jpeg',
            bio: 'Building robust APIs with Node.js and MongoDB.',
            verified: true,
            link: ''
        },
        {
            id: 6,
            name: 'Md. Emran Ahmod',
            role: 'UI/UX Designer',
            image: '/imran.jpg',
            bio: 'Designing intuitive and delightful user experiences.',
            verified: true,
            link: ''
        },
        {
            id: 7,
            name: 'Md. Saikat Islam',
            role: 'Database Administrator',
            image: '/saikat.png',
            bio: 'Optimizing databases for performance and scalability.',
            verified: true,
            link: 'https://tis-protfolio.vercel.app/'
        },
        {
            id: 8,
            name: 'Md Mohosinath Mahomud',
            role: 'QA & Testing Specialist',
            image: '/mohos.jpg',
            bio: 'Ensuring quality with thorough testing strategies.',
            verified: true,
            link: ''
        },
    ]



    return (
        <>
            <section className='py-24 px-4 bg-[#FFFBF2] dark:bg-[#0B1120]'>
                <div className='max-w-7xl mx-auto'>
                    <h2 className='text-4xl md:text-5xl font-serif font-bold text-center mb-16'>
                        Developer Team
                    </h2>

                    {/* Mentors aligned right */}
                    <div className='flex justify-center mb-24'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
                            {mentors.map(m => (
                                <ProfileCard key={m.id} person={m} badge='Mentor' />
                            ))}
                        </div>
                    </div>

                    {/* Team Leader */}
                    <div className='flex justify-center mb-24'>
                        <ProfileCard person={teamLead} badge='Team Leader' />
                    </div>

                    {/* Other Members */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
                        {teamMembers.map(m => (
                            <ProfileCard key={m.id} person={m} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default DeveloperTeam
