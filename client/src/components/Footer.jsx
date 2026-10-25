import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const companyLinks = [
  { label: 'Home', to: '/' },
  { label: 'About us', to: '#' },
  { label: 'Contact us', to: '#' },
  { label: 'Privacy policy', to: '#' },
]

const Footer = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to your newsletter service
    e.target.reset()
  }

  return (
    <footer className='w-full mt-20 px-6 md:px-16 lg:px-24 xl:px-32 pt-12 text-gray-500 bg-white border-t border-gray-200'>
      <div className='flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-gray-200'>
        {/* Brand */}
        <div className='md:max-w-sm'>
          <img className='h-9' src={assets.logo} alt='Quick.ai' />
          <p className='mt-5 text-sm leading-relaxed'>
            AI-powered creative workspace for writing articles, building resumes, generating
            images, and editing photos with background and object removal.
          </p>
        </div>

        {/* Links + newsletter */}
        <div className='flex flex-col sm:flex-row gap-10 sm:gap-16 lg:gap-24'>
          <div>
            <h2 className='mb-4 font-semibold text-gray-800'>Company</h2>
            <ul className='space-y-2 text-sm'>
              {companyLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className='hover:text-primary transition-colors'>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='sm:max-w-xs'>
            <h2 className='mb-4 font-semibold text-gray-800'>Subscribe to our newsletter</h2>
            <p className='text-sm'>
              The latest news, articles, and resources, sent to your inbox weekly.
            </p>

            <form onSubmit={handleSubmit} className='mt-4 flex items-center gap-2'>
              <label htmlFor='newsletter-email' className='sr-only'>
                Email address
              </label>
              <input
                id='newsletter-email'
                type='email'
                required
                placeholder='Enter your email'
                className='flex-1 min-w-0 h-10 px-3 text-sm text-gray-800 placeholder-gray-400 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
              />
              <button
                type='submit'
                className='h-10 px-4 text-sm text-white rounded-lg bg-primary hover:bg-primary/90 active:scale-95 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <p className='py-5 text-center text-xs md:text-sm'>
        Copyright {new Date().getFullYear()} © Quick.ai. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer