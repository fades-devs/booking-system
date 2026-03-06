import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {Route, Routes} from 'react-router-dom';
import {useIdleTimer} from 'react-idle-timer';

import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { useAuth0 } from '@auth0/auth0-react';

function App() {

  const {logout, isAuthenticated} = useAuth0();

  const onIdle = () => {
    if (isAuthenticated) {
      alert('You have been logged out due to inactivity.');
      logout({logoutParams: {returnTo: window.location.origin}})
    }
  }

  useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 20, // 15 mins
  })

  return (
    <div className='flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900'>
    <header className='bg-slate-900 text-white p-5'>
      <Navbar />
    </header>
      <main className='flex flex-col grow w-full mx-auto p-5'>
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/my-bookings" element={ <MyBookings />} />
          <Route path="/dashboard" element={ <Dashboard /> }></Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
