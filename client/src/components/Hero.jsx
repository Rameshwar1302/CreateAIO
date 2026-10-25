import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className='relative flex flex-col items-center justify-center w-full min-h-dvh px-4 sm:px-20 xl:px-32 pt-24 pb-12 text-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat'>
      <div className='max-w-3xl'>
        <h1 className='text-4xl sm:text-6xl 2xl:text-7xl font-semibold leading-[1.15] text-slate-800'>
          Create amazing content <br className='hidden sm:block' />
          with <span className='text-primary'>AI tools</span>
        </h1>

        <p className='mt-5 sm:mt-6 mx-auto max-w-xl text-base sm:text-lg text-slate-600'>
          Transform your content creation with our suite of premium AI tools. Write articles,
          generate images, and enhance your workflow.
        </p>
      </div>

      <div className='mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto'>
        <button
          onClick={() => navigate('/ai')}
          className='w-full sm:w-auto px-10 py-3 rounded-lg text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        >
          Start creating now
        </button>

        <button
          onClick={scrollToTools}
          className='w-full sm:w-auto px-10 py-3 rounded-lg bg-white/80 border border-gray-300 text-slate-700 hover:bg-white hover:scale-[1.02] active:scale-95 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        >
          See the tools
        </button>
      </div>

      <p className='mt-5 text-sm text-slate-500'>Free to start. No credit card needed.</p>
    </section>
  )
}

export default Hero