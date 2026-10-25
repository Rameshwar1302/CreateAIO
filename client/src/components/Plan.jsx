import React from 'react'
import { PricingTable } from '@clerk/react'

const Plan = () => {
  return (
    <section id='pricing' className='scroll-mt-24 max-w-2xl mx-auto px-4 sm:px-0 my-24 z-20'>
      <div className='text-center'>
        <h2 className='text-3xl sm:text-4xl font-semibold text-slate-700'>Choose your plan</h2>
        <p className='mt-3 mx-auto max-w-lg text-slate-500'>
          Start for free and scale up as you grow. Find the perfect plan for your content creation.
        </p>
      </div>

      <div className='mt-12'>
        <PricingTable />
      </div>
    </section>
  )
}

export default Plan