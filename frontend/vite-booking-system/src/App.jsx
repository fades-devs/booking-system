import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {Route, Routes} from 'react-router-dom';

import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {

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
