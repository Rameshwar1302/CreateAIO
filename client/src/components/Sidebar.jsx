import React from 'react'
import { useClerk, useUser } from '@clerk/react'
import {
  Eraser,
  FileText,
  Hash,
  House,
  Users,
  Image,
  Scissors,
  SquarePen,
  LogOut,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-title', label: 'Blog Title', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, isLoaded } = useUser()
  const { signOut, openUserProfile } = useClerk()

  if (!isLoaded || !user) return null

  return (
    <aside
      className={`w-60 max-sm:w-72 max-sm:max-w-[85vw] shrink-0 bg-white border-r border-gray-200 flex flex-col
      max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-20 max-sm:shadow-xl
      ${sidebar ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'}
      transition-transform duration-300 ease-in-out motion-reduce:transition-none`}
    >
      {/* Profile */}
      <button
        type='button'
        onClick={() => openUserProfile()}
        className='mx-3 mt-5 mb-4 p-3 flex items-center gap-3 rounded-xl text-left hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C81F6]'
      >
        <img
          src={user.imageUrl}
          alt=''
          className='w-11 h-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm'
        />
        <div className='min-w-0'>
          <p className='text-sm font-medium text-slate-800 truncate'>{user.fullName}</p>
          <p className='text-xs text-slate-500 truncate'>
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </button>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto flex flex-col gap-1 px-3 pb-3'>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/ai'}
            onClick={() => setSidebar(false)}
            className={({ isActive }) =>
              `px-3.5 py-2.5 max-sm:py-3 flex items-center gap-3 rounded-lg text-sm max-sm:text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C81F6] ${
                isActive
                  ? 'bg-gradient-to-r from-[#3C81F6] to-[#9834EA] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon className='w-4 h-4 shrink-0' />
            <span className='truncate'>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className='border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
        <button
          type='button'
          onClick={() => signOut()}
          className='w-full px-3.5 py-2.5 flex items-center gap-3 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500'
        >
          <LogOut className='w-4 h-4 shrink-0' />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar