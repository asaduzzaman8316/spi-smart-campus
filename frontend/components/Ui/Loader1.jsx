import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import React from 'react'

function Loader1() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
            <div className='size-36'>
                <DotLottieReact
                    src="/loader1.lottie"
                    loop
                    autoplay
                />
            </div>
        </div>
    )
}

export default Loader1