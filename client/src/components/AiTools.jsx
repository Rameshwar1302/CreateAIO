import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/react'

const AiTools = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <section id='tools' className='scroll-mt-24 px-4 sm:px-20 xl:px-32 my-24'>
      <div className='text-center'>
        <h2 className='text-3xl sm:text-4xl font-semibold text-slate-700'>Powerful AI tools</h2>
        <p className='mt-3 mx-auto max-w-lg text-slate-500'>
          Everything you need to create, enhance and optimize your content with cutting-edge AI
          technology.
        </p>
      </div>

      <div className='mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'>
        {AiToolsData.map((tool, index) => (
          <button
            key={index}
            type='button'
            onClick={() => (user ? navigate(tool.path) : openSignIn())}
            className='group text-left p-6 sm:p-8 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0'
          >
            <div className='w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3C81F6] to-[#9834EA] shadow-sm'>
              <tool.Icon className='w-6 h-6 text-white' />
            </div>

            <h3 className='mt-6 mb-2 text-lg font-semibold text-slate-800'>{tool.title}</h3>
            <p className='text-sm text-slate-500 leading-relaxed'>{tool.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default AiTools