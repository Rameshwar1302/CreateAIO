import React from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react';
const AiTools = () => {
const navigate = useNavigate();
const {user} = useUser();
  return (
    <div className='px-4 sm:px-20 xl:px-32 my-24'>
        <div className='text-center'>
            <h2>Powerful AI Tools</h2>
            <p>Everything you need to create, Enhance, optimize your content with cutting-edge AI technology </p>

        </div>
        <div className='flex flex-wrap mb-6'>
            {AiToolsData.map((tool, index)=>(
                <div key={index} className=''  onClick={()=>user && navigate(tool.path)}>
                    <tool.Icon className='' />
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>

                </div>
            ))}

        </div>
    </div>
  )
}

export default AiTools