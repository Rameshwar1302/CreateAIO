import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SignIn, useUser } from '@clerk/react'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar.jsx'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user, isLoaded } = useUser()

  // Avoid flashing the sign-in form while Clerk is still loading
  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-dvh bg-[#F4F7FB]'>
        <div className='w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin motion-reduce:animate-none' />
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center h-dvh bg-[#F4F7FB]'>
        <SignIn />
      </div>
    )
  }

  return (
    <div className='flex flex-col h-dvh'>
      {/* Top bar */}
      <header className='h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200'>
        <img
          className='cursor-pointer w-32 sm:w-40'
          src={assets.logo}
          onClick={() => navigate('/')}
          alt='Quick.ai home'
        />

        <button
          type='button'
          onClick={() => setSidebar(!sidebar)}
          aria-label={sidebar ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebar}
          className='sm:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-[#3C81F6]'
        >
          {sidebar ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </header>

      {/* Body */}
      <div className='relative flex flex-1 min-h-0'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Mobile backdrop: tap outside to close the menu */}
        {sidebar && (
          <div
            onClick={() => setSidebar(false)}
            className='sm:hidden absolute inset-0 z-10 bg-slate-900/30'
            aria-hidden='true'
          />
        )}

        <main className='flex-1 min-w-0 bg-[#F4F7FB]'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout