import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, useUser, UserButton } from '@clerk/react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <header className='fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60'>
      <div className='flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32'>
        <img
          src={assets.logo}
          alt='Quick.ai home'
          className='w-32 sm:w-44 cursor-pointer'
          onClick={() => navigate('/')}
        />

        {user ? (
          <div className='flex items-center gap-4'>
            <Link
              to='/ai'
              className='hidden sm:inline text-sm text-slate-600 hover:text-slate-900 transition-colors'
            >
              Dashboard
            </Link>
            <UserButton />
          </div>
        ) : (
          <button
            onClick={() => openSignIn()}
            className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary hover:bg-primary/90 transition-colors text-white px-6 sm:px-10 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          >
            Get started <ArrowRight className='w-4 h-4' />
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar