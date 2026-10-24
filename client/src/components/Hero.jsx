import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
    const navigate = useNavigate();
  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>

        <div className='text-center mb-6'>
            <h1>Create Amazing Content <br /> With <span>AI tools</span></h1>
            <p>Transform your content creation with our suite of premium AI tools. Write articles, generate images, and enhance your workflow.</p>
        </div>

        <div>
            <button onClick={()=>{navigate('/ai')}}>
                Strat Creating now
            </button>
        </div>

    </div>
  )
}

export default Hero