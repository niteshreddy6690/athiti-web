"use client";

import React, { useState } from 'react';
import { Plus, Volume2, Eye } from 'lucide-react';
import useFetch from '@/hooks/useFetcher';
import Link from 'next/link';

const RoomDisplayComponent = () => {
  const { data:rooms, loading, error } = useFetch("/room");

console.log(rooms);



  // Status colors - clean and modern
  const getStatusStyles = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'occupied':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'maintenance':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'cleaning':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  // Status indicator dot
  const getStatusDot = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500';
      case 'occupied':
        return 'bg-rose-500';
      case 'maintenance':
        return 'bg-amber-500';
      case 'cleaning':
        return 'bg-sky-500';
      default:
        return 'bg-gray-500';
    }
  };
  const handleCheck = (roomNumber) => {
    console.log(`Check action for room ${roomNumber}`);
  };

  const handleViewDetails = (roomNumber) => {
    console.log(`View details for room ${roomNumber}`);
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading rooms...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error loading rooms</div>
          <p className="text-gray-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No rooms found
  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-lg">No rooms found</div>
          <p className="text-gray-500">Please check your API connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Room Overview</h1>
      
      <div className="flex flex-wrap gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={`relative group border-2 rounded-xl p-5 w-64 h-36 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${getStatusStyles(room.status)}`}
          >
           
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(room.status)}`}></div>
                <h2 className="text-xl font-bold">Room {room.roomNumber}</h2>
              </div>
            </div>

       
            <div className="space-y-1">
              <p className="text-sm font-medium capitalize">{room.roomType}</p>
              <p className="text-sm opacity-75">Capacity: {room.capacity} guests</p>
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                {room.status}
              </p>
            </div>

            <div className="absolute inset-0 bg-white/70 bg-opacity-95 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-3">
              {
                room.status === 'available' && (  <button
                  onClick={() => handleCheck(room.roomNumber )}
                  className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg cursor-pointer"
                  title="Check In/Out"
                >
                  <Plus size={18} />
                </button>)
              }
                <button
                  className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg cursor-pointer"
                  title="View Details"
                >
                 <Link href={`/rooms/${room._id}`}>
                  <Eye size={18} />
                 </Link>
                </button>
               
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Available</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {rooms.filter(r => r.status === 'available').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Occupied</span>
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {rooms.filter(r => r.status === 'occupied').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Maintenance</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {rooms.filter(r => r.status === 'maintenance').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Cleaning</span>
          </div>
          <div className="text-2xl font-bold text-sky-600">
            {rooms.filter(r => r.status === 'cleaning').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDisplayComponent;