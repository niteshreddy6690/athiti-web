
import React from 'react';

const UserDetails = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Details</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter guest's name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter guest's email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone</label>
          <input
            type="tel"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter guest's phone number"
          />
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
