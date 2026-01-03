import { useEffect, useState } from 'react'
import { fetchCurrentLoggedInUser } from './api/fetchCurrentUser'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'

function App() {

  const {setUser, setLoading} = useAuth()

  useEffect(() => {
    fetchCurrentLoggedInUser(setUser, setLoading)
  }, [setUser, setLoading])

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='grow'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
