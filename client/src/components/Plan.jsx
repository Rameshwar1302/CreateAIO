import React from 'react'
import { PricingTable } from '@clerk/react';

const  Plan  = () => {
  return (
    <div className='max-w-2xl mx-auto z-20 my-30'>
        <div className='text-center'>
            <h2>
                Choose your Plan
            </h2>
            <p>
                Start for free and scale up as you grow. Find the perfect plan for your content creation.
            </p>
        </div>
        <div>
            <PricingTable/>
        </div>
    </div>
  )
}

export default Plan; 