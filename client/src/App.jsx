import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import WriteArticle from './pages/WriteArticle.jsx'
import GenerateImages from './pages/GenerateImages.jsx'
import BlogTitle from './pages/BlogTitle.jsx'
import Community from './pages/Community.jsx'
import { useAuth } from '@clerk/react'

const App = () => {
  const {getToken} = useAuth();
  useEffect(()=>{
    getToken().then((token)=>console.log(token)
    )
  })
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        
        <Route path='/ai' element={<Layout/>} >
          <Route index element={<Dashboard />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='review-resume' element={<ReviewResume />} />
          <Route path='write-article' element={<WriteArticle />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='blog-title' element={<BlogTitle />} />
          <Route path='community' element={<Community />} />

        </Route>
      </Routes>
    </div>
  )
}

export default App