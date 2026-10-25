import React from 'react'
import Markdown from 'react-markdown'
import { ChevronDown } from 'lucide-react'

const formatDate = (item) => {
  const raw = item.created_at || item.createdAt
  if (!raw) return ''
  return new Date(raw).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const CreationItem = ({ item, meta, expanded, onToggle }) => {
  const { Icon, label, badge, tile } = meta
  const isImage = item.type === 'image'
  const date = formatDate(item)

  return (
    <div className='bg-white border border-gray-200 rounded-xl overflow-hidden transition-shadow hover:shadow-sm'>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={expanded}
        className='w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3C81F6]'
      >
        {/* Thumbnail for images, icon tile for everything else */}
        {isImage && item.content ? (
          <img
            src={item.content}
            alt=''
            loading='lazy'
            className='w-11 h-11 shrink-0 rounded-lg object-cover'
          />
        ) : (
          <div className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center ${tile}`}>
            <Icon className='w-5 h-5' />
          </div>
        )}

        <div className='min-w-0 flex-1'>
          <h3 className={`text-sm font-medium text-slate-800 ${expanded ? '' : 'truncate'}`}>
            {item.prompt}
          </h3>
          {date && <p className='mt-0.5 text-xs text-slate-500'>{date}</p>}
        </div>

        <span className={`hidden sm:inline-block shrink-0 whitespace-nowrap px-3 py-0.5 text-xs border rounded-full ${badge}`}>
          {label}
        </span>

        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300 motion-reduce:transition-none ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Smooth expand / collapse */}
      <div
        aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='mx-3 sm:mx-4 mb-3 sm:mb-4 pt-4 border-t border-gray-100'>
            {isImage ? (
              <img
                src={item.content}
                alt={item.prompt || 'Generated image'}
                loading='lazy'
                className='w-full max-w-md rounded-lg'
              />
            ) : (
              <div className='max-h-96 overflow-y-auto pr-2 text-sm text-slate-700 reset-tw'>
                <Markdown>{item.content || ''}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreationItem