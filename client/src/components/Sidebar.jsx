import React from 'react';
import { useClerk, useUser } from '@clerk/react';
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
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-title', label: 'Blog Title', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  if (!isLoaded || !user) return null;

  return (
    <div
      className={`w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between
      max-sm:absolute max-sm:top-14 max-sm:bottom-0 max-sm:z-20
      ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'}
      transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        <div
          onClick={() => openUserProfile()}
          className=" cursor-pointer"
        >
           <img className='w-13 rounded-full mx-auto' src={user.imageUrl} alt="user Avatar" />
            <h1 className='m-1 text-center'>{user.fullName}</h1>
        </div>

        <nav className="flex flex-col px-3 gap-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9834EA] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="w-full border-t border-gray-200 p-4 flex items-center justify-between">
        <div
          onClick={() => openUserProfile()}
          className="flex gap-2 items-center cursor-pointer min-w-0"
        >
          <img src={user.imageUrl} className="w-8 rounded-full" alt="" />
          <span className="text-sm font-medium truncate">
            {user.fullName}
          </span>
        </div>

        <button onClick={() => signOut()} aria-label="Log out">
          <LogOut className="w-4 h-4 text-gray-400 hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;