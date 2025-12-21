
import {  BadgeCheck, Crown } from 'lucide-react'
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
                            <BadgeCheck className='size-5 text-blue-500' />
                        )}
                    </div>
                    <p className='text-sm text-gray-300 mb-2'>{person.role}</p>
                    <p className='text-sm text-gray-400 line-clamp-2 mb-4'>{person.bio}</p>

                    <a target='_blank' href={person.link} className='block w-full bg-white/90 text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white transition text-center'>
                        View Profile
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard
