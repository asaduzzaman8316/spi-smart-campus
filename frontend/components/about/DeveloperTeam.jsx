'use client'
import { Bookmark, CheckCircle2, Crown } from 'lucide-react'

const DeveloperTeam = () => {
    const mentors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            role: 'Project Mentor',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
            bio: 'Guiding students with expertise in software engineering. Passionate about nurturing innovation and technical excellence.',
            verified: true,
        },
        {
            id: 2,
            name: 'Prof. Ahmed Rahman',
            role: 'Technical Advisor',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
            bio: 'Expert in Full-Stack Development and System Architecture. Committed to building scalable solutions.',
            verified: true,
        },
    ]

    const teamLead = {
        id: 3,
        name: 'Alex Thompson',
        role: 'Team Lead & Full-Stack Developer',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop',
        bio: 'Leading the team with a strong vision and building scalable systems with modern technologies.',
        verified: true,
    }

    const teamMembers = [
        {
            id: 4,
            name: 'Maria Garcia',
            role: 'Frontend Developer',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
            bio: 'UI/UX enthusiast specializing in React & Next.js.',
            verified: true,
        },
        {
            id: 5,
            name: 'James Wilson',
            role: 'Backend Developer',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop',
            bio: 'Building robust APIs with Node.js and MongoDB.',
            verified: false,
        },
        {
            id: 6,
            name: 'Priya Sharma',
            role: 'UI/UX Designer',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
            bio: 'Designing intuitive and delightful user experiences.',
            verified: true,
        },
        {
            id: 7,
            name: 'David Chen',
            role: 'Database Administrator',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
            bio: 'Optimizing databases for performance and scalability.',
            verified: false,
        },
        {
            id: 8,
            name: 'Emma Brown',
            role: 'QA & Testing Specialist',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
            bio: 'Ensuring quality with thorough testing strategies.',
            verified: true,
        },
    ]

    const ProfileCard = ({ person, badge }) => {
        return (
            <div className='group  relative w-full max-w-[360px] mx-auto'>
                <div className='relative rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500'>
                    <img
                        src={person.image}
                        alt={person.name}
                        className='w-full h-[520px] object-cover group-hover:scale-110 transition-transform duration-700'
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20' />

                    {badge && (
                        <div className='absolute top-5 left-5'>
                            <span className='flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold'>
                                <Crown className='w-4 h-4' /> {badge}
                            </span>
                        </div>
                    )}
                    <div className='absolute bottom-0 p-6 text-white w-full'>
                        <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-xl font-bold'>{person.name}</h3>
                            {person.verified && (
                                <CheckCircle2 className='w-5 h-5 text-blue-400 fill-blue-400' />
                            )}
                        </div>
                        <p className='text-sm text-gray-300 mb-2'>{person.role}</p>
                        <p className='text-sm text-gray-400 line-clamp-2 mb-4'>{person.bio}</p>

                        <button className='w-full bg-white/90 text-black py-2.5 rounded-xl font-semibold text-sm hover:bg-white transition'>
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        )
    }

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
