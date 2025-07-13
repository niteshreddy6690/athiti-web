import React from 'react'
import { Search, Bell, User, Settings } from 'lucide-react'

const Header = () => {
  return (
    <div className='max-w-[calc(100vw-86px)] w-full flex items-center justify-between h-[60px] fixed top-0 z-10  px-2 bg-white shadow-md'>
      {/* Left side - Logo/Brand */}
      <div className='flex items-center'>
        <h1 className='text-xl font-bold text-gray-800'>Hotel Manager</h1>
      </div>

   

      {/* Right side - Actions */}
      <div className='flex items-center space-x-4'>
        {/* Notifications */}
        <button className='relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors'>
          <Bell className='w-5 h-5' />
          <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
        </button>

        {/* Settings */}
        <button className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors'>
          <Settings className='w-5 h-5' />
        </button>

        {/* User Profile */}
        <div className='flex items-center space-x-2'>
          <button className='flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center'>
              <User className='w-4 h-4 text-white' />
            </div>
            <span className='text-sm font-medium'>Admin</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header